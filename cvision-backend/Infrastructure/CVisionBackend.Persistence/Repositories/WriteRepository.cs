using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using CVisionBackend.Application.Repositories;
using CVisionBackend.Domain.Entities.Common;
using CVisionBackend.Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Repositories
{
    public class WriteRepository<T> : IWriteRepository<T> where T : BaseEntity
    {
        private readonly CVisionDbContext _context;
        public WriteRepository(CVisionDbContext context)
        {
            _context = context;
        }

        public DbSet<T> Table => _context.Set<T>();

        public async Task<bool> AddAsync(T model)
        {
            EntityEntry<T> entityEntry = await Table.AddAsync(model);
            return entityEntry.State == EntityState.Added;
        }

        public async Task<bool> AddRangeAsync(List<T> data)
        {
            await Table.AddRangeAsync(data);
            return true;
        }

        public bool Remove(T model)
        {
            EntityEntry entityEntry = Table.Remove(model);
            return entityEntry.State == EntityState.Deleted;
        }

        public async Task<bool> RemoveAsync(Guid id)
        {
            T? model = await Table.FirstOrDefaultAsync(data => data.Id == id);
            if (model == null)
                return false;

            return Remove(model);
        }


        public bool RemoveRange(List<T> data)
        {
            Table.RemoveRange(data);
            return true;
        }

        public async Task<int> SaveAsync()
            => await _context.SaveChangesAsync();


        public bool Update(T model)
        {
            EntityEntry entityEntry = Table.Update(model);
            return entityEntry.State == EntityState.Modified;
        }
    }
}
