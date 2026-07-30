from django.contrib import admin
from django.utils.html import format_html
from products.models import Product, ProductImage

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'get_preview')
    readonly_fields = ('get_preview',)

    def get_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="80" height="80" style="object-fit: cover; border-radius: 4px;" />', obj.image.url)
        return ""
    get_preview.short_description = 'Aperçu'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('nom', 'get_thumbnail', 'prix', 'categorie', 'est_publie', 'date_creation')
    search_fields = ('nom', 'description', 'categorie__nom')
    prepopulated_fields = {'slug': ('nom',)}
    list_filter = ('est_publie', 'categorie', 'date_creation')
    inlines = [ProductImageInline]
    ordering = ('-date_creation',)

    def get_thumbnail(self, obj):
        if obj.image_principale:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />', obj.image_principale.url)
        return "Pas d'image' "
    get_thumbnail.short_description = 'Aperçu'
