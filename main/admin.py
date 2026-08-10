from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import (
    Role, User,  
    Question, Answer, ForumPost, Reply, Opportunity,
    AlumniProfile, MentorshipRequest, AIChatSession,
    ForumCategory,
    ResourceCategory, Resource,
    # NEW MODELS FOR ALUMNI
    AlumniPost, PostComment, PostLike, Message
)

# --- USER & ROLE MANAGEMENT ---

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Fixed UserAdmin for custom User model (no username field)
    """
    ordering = ("-created_at",)
    list_display = ("email", "full_name", "role", "is_staff", "created_at")
    list_filter = ("is_staff", "is_active", "role")
    search_fields = ("email", "full_name")
    
    # FIX: Remove username field from add form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )
    
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("full_name", "bio", "profile_image", "role")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Important dates"), {"fields": ("last_login", "created_at", "updated_at")}),
    )
    readonly_fields = ("created_at", "updated_at")
    
    # Override to use correct fieldsets
    def get_fieldsets(self, request, obj=None):
        if not obj:
            return self.add_fieldsets
        return super().get_fieldsets(request, obj)

@admin.register(AIChatSession)
class AIChatSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'query', 'created_at')
    search_fields = ('user__full_name', 'query')

# --- ALUMNI & MENTORSHIP MANAGEMENT ---

@admin.register(AlumniProfile)
class AlumniProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'current_title', 'current_company', 'industry', 'is_mentor', 'is_available_for_mentoring', 'graduation_year')
    list_filter = ('is_mentor', 'is_available_for_mentoring', 'industry', 'graduation_year')
    search_fields = ('user__full_name', 'current_company', 'current_title')
    
    fieldsets = (
        ('Professional Info', {'fields': ('user', 'current_title', 'current_company', 'industry', 'location', 'graduation_year', 'linkedin_url')}),
        ('Mentorship Status', {'fields': ('is_mentor', 'is_available_for_mentoring', 'mentorship_focus', 'monthly_slots', 'bio_summary')}),
        ('Additional Info', {'fields': ('expertise', 'profile_image', 'role', 'department')}),
        ('Success Story', {'fields': ('has_success_story', 'story_title', 'story_content')}),
    )
    
    actions = ['make_mentor', 'make_alumni', 'make_available', 'make_unavailable']
    
    def make_mentor(self, request, queryset):
        queryset.update(is_mentor=True)
        self.message_user(request, f"{queryset.count()} alumni converted to mentors.")
    make_mentor.short_description = "Convert to Mentor"
    
    def make_alumni(self, request, queryset):
        queryset.update(is_mentor=False)
        self.message_user(request, f"{queryset.count()} mentors converted to alumni.")
    make_alumni.short_description = "Convert to Alumni"
    
    def make_available(self, request, queryset):
        queryset.update(is_available_for_mentoring=True)
        self.message_user(request, f"{queryset.count()} profiles set as available for mentoring.")
    make_available.short_description = "Set as Available for Mentoring"
    
    def make_unavailable(self, request, queryset):
        queryset.update(is_available_for_mentoring=False)
        self.message_user(request, f"{queryset.count()} profiles set as unavailable for mentoring.")
    make_unavailable.short_description = "Set as Unavailable for Mentoring"

@admin.register(MentorshipRequest)
class MentorshipRequestAdmin(admin.ModelAdmin):
    list_display = ('student', 'mentor', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('student__full_name', 'mentor__user__full_name')
    readonly_fields = ('created_at',)
    actions = ['accept_requests', 'reject_requests', 'pending_requests']
    
    def accept_requests(self, request, queryset):
        queryset.update(status='accepted')
        self.message_user(request, f"{queryset.count()} mentorship requests accepted.")
    accept_requests.short_description = "Accept selected requests"
    
    def reject_requests(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f"{queryset.count()} mentorship requests rejected.")
    reject_requests.short_description = "Reject selected requests"
    
    def pending_requests(self, request, queryset):
        queryset.update(status='pending')
        self.message_user(request, f"{queryset.count()} mentorship requests set to pending.")
    pending_requests.short_description = "Mark as Pending"

# --- ALUMNI POSTS MANAGEMENT ---

@admin.register(AlumniPost)
class AlumniPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author_name', 'created_at', 'is_published', 'comments_count', 'likes_count')
    list_filter = ('is_published', 'created_at')
    search_fields = ('title', 'content', 'author__user__full_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Post Content', {'fields': ('author', 'title', 'content')}),
        ('Status', {'fields': ('is_published',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    def author_name(self, obj):
        return obj.author.user.full_name
    author_name.short_description = 'Author'
    
    def comments_count(self, obj):
        return obj.comments.count()
    comments_count.short_description = '💬 Comments'
    
    def likes_count(self, obj):
        return obj.likes.count()
    likes_count.short_description = '❤️ Likes'
    
    actions = ['publish_posts', 'unpublish_posts']
    
    def publish_posts(self, request, queryset):
        queryset.update(is_published=True)
        self.message_user(request, f"{queryset.count()} posts published.")
    publish_posts.short_description = "Publish selected posts"
    
    def unpublish_posts(self, request, queryset):
        queryset.update(is_published=False)
        self.message_user(request, f"{queryset.count()} posts unpublished.")
    unpublish_posts.short_description = "Unpublish selected posts"

@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = ('post_title', 'user_name', 'content_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('post__title', 'user__full_name', 'content')
    readonly_fields = ('created_at',)
    
    def post_title(self, obj):
        return obj.post.title
    post_title.short_description = 'Post'
    
    def user_name(self, obj):
        return obj.user.full_name
    user_name.short_description = 'User'
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Comment'

@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ('post_title', 'user_name', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('post__title', 'user__full_name')
    readonly_fields = ('created_at',)
    
    def post_title(self, obj):
        return obj.post.title
    post_title.short_description = 'Post'
    
    def user_name(self, obj):
        return obj.user.full_name
    user_name.short_description = 'User'

# --- MESSAGES MANAGEMENT ---

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender_name', 'recipient_name', 'subject_preview', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('sender__full_name', 'recipient__user__full_name', 'subject', 'content')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Message Details', {'fields': ('sender', 'recipient', 'subject', 'content')}),
        ('Status', {'fields': ('is_read', 'created_at')}),
    )
    
    def sender_name(self, obj):
        return obj.sender.full_name
    sender_name.short_description = 'From'
    
    def recipient_name(self, obj):
        return obj.recipient.user.full_name
    recipient_name.short_description = 'To'
    
    def subject_preview(self, obj):
        return obj.subject[:50] + '...' if len(obj.subject) > 50 else obj.subject
    subject_preview.short_description = 'Subject'
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
        self.message_user(request, f"{queryset.count()} messages marked as read.")
    mark_as_read.short_description = "Mark as Read"
    
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
        self.message_user(request, f"{queryset.count()} messages marked as unread.")
    mark_as_unread.short_description = "Mark as Unread"

# --- FORUM MANAGEMENT ---

@admin.register(ForumCategory)
class ForumCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

class ReplyInline(admin.TabularInline):
    model = Reply
    extra = 1

@admin.register(ForumPost)
class ForumPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'post_type', 'is_approved', 'created_at')
    list_filter = ('post_type', 'is_approved', 'created_at')
    search_fields = ('title', 'content', 'author__full_name')
    fieldsets = (
        ('Content', {'fields': ('title', 'content', 'image')}),
        ('Moderation', {'fields': ('is_approved', 'is_anonymous')}),
        ('Metadata', {'fields': ('author', 'post_type', 'category', 'tags')}),
    )
    inlines = [ReplyInline]

# --- RESOURCE & ACADEMIC MANAGEMENT ---

@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'order']
    list_editable = ['order']
    search_fields = ['name']

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'resource_type', 'is_free', 'is_featured', 'views_count']
    list_filter = ['category', 'resource_type', 'is_free', 'is_featured']
    search_fields = ['title', 'description']
    list_editable = ['is_featured']
    readonly_fields = ['views_count']
    
    fieldsets = (
        ('Basic Info', {'fields': ('title', 'description', 'category', 'resource_type')}),
        ('Content', {'fields': ('file', 'external_link')}),
        ('Status', {'fields': ('is_free', 'is_featured', 'views_count')}),
    )

class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "views", "created_at")
    search_fields = ("title", "body")
    inlines = [AnswerInline]
    readonly_fields = ['views']

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ("question", "author", "is_accepted", "created_at")
    list_filter = ("is_accepted",)
    search_fields = ("question__title", "author__full_name")

@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ('title', 'organization', 'country', 'category', 'opportunity_type', 'funding', 'deadline')
    list_filter = ('category', 'opportunity_type', 'funding', 'country')
    search_fields = ('title', 'organization', 'description', 'category')
    readonly_fields = ['posted_by']
    
    fieldsets = (
        ('Basic Info', {'fields': ('title', 'organization', 'country', 'description')}),
        ('Category', {'fields': ('category',)}),
        ('Details', {'fields': ('opportunity_type', 'funding', 'deadline', 'url')}),
        ('Image', {'fields': ('image',)}),
    )
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.posted_by = request.user
        super().save_model(request, obj, form, change)