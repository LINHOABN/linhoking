from django.contrib import admin
from categories.models import Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('nom', 'slug', 'date_creation')
    search_fields = ('nom', 'slug')
    prepopulated_fields = {'slug': ('nom',)}
    list_filter = ('date_creation',)
    ordering = ('nom',)
