using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Domain.Entities.Common
{
    public class BaseEntity
    {
        public Guid Id { get; set; }
        public virtual DateTime? CreatedAt { get; set; }
        public virtual DateTime? UpdatedAt { get; set; }
        public virtual bool IsDeleted { get; set; }
    }
}
