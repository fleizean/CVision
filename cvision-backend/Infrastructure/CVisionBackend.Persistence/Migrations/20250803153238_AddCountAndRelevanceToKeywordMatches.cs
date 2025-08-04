using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CVisionBackend.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCountAndRelevanceToKeywordMatches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("48189593-60e2-4d33-8c8a-0afa8686b612"));

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("9f8b08cf-595a-49b5-b740-8dec7255c990"));

            migrationBuilder.AddColumn<int>(
                name: "Count",
                table: "KeywordMatches",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "Relevance",
                table: "KeywordMatches",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "CVAnalysisResults",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { new Guid("5add69f8-5e5d-41ba-b15c-6a9d59fe4b35"), null, "User", "USER" },
                    { new Guid("8810cccc-148e-457d-9fad-6c121f38d537"), null, "Admin", "ADMIN" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("5add69f8-5e5d-41ba-b15c-6a9d59fe4b35"));

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("8810cccc-148e-457d-9fad-6c121f38d537"));

            migrationBuilder.DropColumn(
                name: "Count",
                table: "KeywordMatches");

            migrationBuilder.DropColumn(
                name: "Relevance",
                table: "KeywordMatches");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "CVAnalysisResults",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { new Guid("48189593-60e2-4d33-8c8a-0afa8686b612"), null, "User", "USER" },
                    { new Guid("9f8b08cf-595a-49b5-b740-8dec7255c990"), null, "Admin", "ADMIN" }
                });
        }
    }
}
