using Microsoft.EntityFrameworkCore;
using TicketDesk.CommentService.Models;

namespace TicketDesk.CommentService.Data;

public class CommentDbContext : DbContext
{
    public CommentDbContext(DbContextOptions<CommentDbContext> options) : base(options)
    {
    }

    public DbSet<Comment> Comments => Set<Comment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.ToTable("ticket_comments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TicketId).HasColumnName("ticket_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Text).HasColumnName("comment");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => e.TicketId).HasDatabaseName("idx_comments_ticket_id");
            entity.HasIndex(e => e.UserId).HasDatabaseName("idx_comments_user_id");
        });
    }
}
