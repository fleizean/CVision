using CVisionBackend.Application.Repositories;
using CVisionBackend.Domain.Entities.Common;
using CVisionBackend.Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace CVisionBackend.Persistence.Repositories
{
    public class ReadRepository<T> : IReadRepository<T> where T : BaseEntity
    {
        private readonly CVisionDbContext _context;

        public ReadRepository(CVisionDbContext context)
        {
            _context = context;
        }

        public DbSet<T> Table => _context.Set<T>();

        public IQueryable<T> GetAll(bool tracking = true)
        {
            return tracking ? Table.AsQueryable() : Table.AsNoTracking();
        }

        public async Task<T?> GetByIdAsync(Guid id, bool tracking = true)
        {
            return tracking
               ? await Table.FirstOrDefaultAsync(x => x.Id == id)
               : await Table.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<T?> GetSingleAsync(Expression<Func<T, bool>> method, bool tracking = true)
        {
            return tracking
                ? await Table.FirstOrDefaultAsync(method)
                : await Table.AsNoTracking().FirstOrDefaultAsync(method);
        }

        public async Task<List<TResult>> GetWhereAsync<TResult>(
             Expression<Func<T, bool>> method,
             Expression<Func<T, TResult>> selector,
             bool tracking = true)
        {
            var query = Table.Where(method);

            if (!tracking)
                query = query.AsNoTracking();

            return await query.Select(selector).ToListAsync(); // ✅ Artık async çalışır
        }

    }
}
