using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using CVisionBackend.Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<CVisionDbContext>
    {
        public CVisionDbContext CreateDbContext(string[] args)
        {
            DbContextOptionsBuilder<CVisionDbContext> dbContextOptionsBuilder = new();
            dbContextOptionsBuilder.UseSqlServer(Configuration.ConnectionString);
            return new CVisionDbContext(dbContextOptionsBuilder.Options);
        }
    }
}
