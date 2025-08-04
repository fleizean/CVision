using CVisionBackend.Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Repositories
{
    public interface IReadRepository<T> : IRepository<T> where T : BaseEntity   
    {
        IQueryable<T> GetAll(bool tracking = true);
        Task<List<TResult>> GetWhereAsync<TResult>(Expression<Func<T, bool>> method, Expression<Func<T, TResult>> selector, bool tracking = true);
        Task<T?> GetSingleAsync(Expression<Func<T, bool>> method, bool tracking = true);
        Task<T?> GetByIdAsync(Guid id, bool tracking = true);
    }
}
