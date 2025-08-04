using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CVisionBackend.Domain.Entities.Common;
using CVisionBackend.Domain.Entities.Identity;
using CVisionBackend.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Contexts
{
    public class CVisionDbContext : IdentityDbContext<AppUser, AppRole, Guid>
    {
        public CVisionDbContext(DbContextOptions options) : base(options)
        {
            
        }

        public DbSet<CVFile> CVFiles { get; set; }
        public DbSet<CVAnalysisResult> CVAnalysisResults { get; set; }
        public DbSet<KeywordMatch> KeywordMatches { get; set; }
        public DbSet<JobProfile> JobProfiles { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Activity> Activities { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Identity seed data
            modelBuilder.Entity<AppRole>()
                .HasData(
                    new AppRole() { Id = Guid.NewGuid(), Name = "Admin", NormalizedName = "ADMIN" },
                    new AppRole() { Id = Guid.NewGuid(), Name = "User", NormalizedName = "USER" }
                );

            // CVFile relationships
            modelBuilder.Entity<CVFile>()
                .HasOne(f => f.User)
                .WithMany(u => u.CVFiles)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CVFile>()
                .HasOne(f => f.AnalysisResult)
                .WithOne(ar => ar.CVFile)
                .HasForeignKey<CVAnalysisResult>(ar => ar.CVFileId)
                .OnDelete(DeleteBehavior.Cascade);

            // CVAnalysisResult relationships
            modelBuilder.Entity<CVAnalysisResult>()
                .HasMany(ar => ar.KeywordMatches)
                .WithOne(km => km.CVAnalysisResult)
                .HasForeignKey(km => km.CVAnalysisResultId)
                .OnDelete(DeleteBehavior.Cascade);

            // RefreshToken relationships
            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // JSON column configurations for List<string> properties
            modelBuilder.Entity<CVAnalysisResult>()
                .Property(e => e.MissingSectionsJson)
                .HasColumnType("text");

            modelBuilder.Entity<CVAnalysisResult>()
                .Property(e => e.FormatIssuesJson)
                .HasColumnType("text");

            modelBuilder.Entity<JobProfile>()
                .Property(e => e.SuggestedKeywordsJson)
                .HasColumnType("text");

            // Activity relationships
            modelBuilder.Entity<Activity>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Activity>()
                .HasIndex(a => a.Timestamp);

            modelBuilder.Entity<Activity>()
                .HasIndex(a => a.Type);

            modelBuilder.Entity<Activity>()
                .HasIndex(a => a.UserId);
        }


        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var datas = ChangeTracker.Entries<BaseEntity>();
            foreach (var data in datas)
            {
                //_ kullanarak bir atama yapmak istemediğimizi belirtiyoruz.
                _ = data.State switch
                {
                    EntityState.Added => data.Entity.CreatedAt = DateTime.UtcNow,
                    EntityState.Modified => data.Entity.UpdatedAt = DateTime.UtcNow,
                    _ => DateTime.UtcNow,
                };
            }
            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
