from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

def profile_image_upload_to(instance, filename):
    return f"profiles/{filename}"

# --- CATEGORIES ---

class ForumCategory(models.Model):
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Forum Categories"
    
    def __str__(self): 
        return self.name

class ResourceCategory(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, default='📚', help_text="Emoji icon for the category (e.g., 📚, 🎓, ✍️)")
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        verbose_name_plural = "Resource Categories"
        ordering = ['order']
    
    def __str__(self): 
        return self.name

# --- USER & ROLE ---

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self): 
        return self.name

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email: 
            raise ValueError("Email required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name="users")
    bio = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)  
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    profile_image = models.ImageField(upload_to="profiles/", blank=True, null=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]
    objects = UserManager()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self): 
        return self.full_name

class Profile(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'), 
        ('mentor', 'Mentor'), 
        ('alumni', 'Alumni')
    ]
    
    MENTORING_MODE_CHOICES = [
        ('online', 'Online'), 
        ('offline', 'Offline'), 
        ('both', 'Both')
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, null=True, blank=True)
    
    # Common fields
    university = models.CharField(max_length=255, null=True, blank=True)
    department = models.CharField(max_length=255, null=True, blank=True)
    
    # Student fields
    semester = models.CharField(max_length=50, null=True, blank=True)
    interests = models.TextField(null=True, blank=True)
    
    # Mentor fields
    expertise = models.CharField(max_length=255, null=True, blank=True)
    experience_years = models.IntegerField(null=True, blank=True)
    organization = models.CharField(max_length=255, null=True, blank=True)
    mentoring_mode = models.CharField(
        max_length=20, 
        null=True, 
        blank=True, 
        choices=MENTORING_MODE_CHOICES
    )
    
    # Alumni fields
    grad_year = models.IntegerField(null=True, blank=True)
    current_company = models.CharField(max_length=255, null=True, blank=True)
    industry = models.CharField(max_length=255, null=True, blank=True)
    willing_to_mentor = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self): 
        return f"{self.user.email} - {self.role or 'No Role'}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a Profile when a new User is created"""
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the Profile when User is saved"""
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        # If profile doesn't exist, create it
        Profile.objects.create(user=instance)

# --- AI & MENTORSHIP ---

class AIChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ai_chats")
    query = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self): 
        return f"{self.user.email} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class AlumniProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="alumni_profile")
    current_title = models.CharField(max_length=255)
    current_company = models.CharField(max_length=255)
    industry = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    graduation_year = models.PositiveIntegerField()
    is_mentor = models.BooleanField(default=False)
    mentorship_focus = models.CharField(max_length=255, blank=True)
    monthly_slots = models.PositiveIntegerField(default=2) 
    bio_summary = models.TextField()
    has_success_story = models.BooleanField(default=False)
    story_title = models.CharField(max_length=255, blank=True)
    story_content = models.TextField(blank=True)
    linkedin_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Additional fields for alumni page functionality
    role = models.CharField(max_length=20, choices=[('alumni', 'Alumni'), ('mentor', 'Mentor')], default='alumni')
    department = models.CharField(max_length=255, blank=True, null=True)
    expertise = models.CharField(max_length=500, blank=True, help_text="Comma-separated skills")
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    is_available_for_mentoring = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self): 
        return f"{self.user.full_name} - {self.current_title}"
    
    def get_expertise_list(self):
        """Convert comma-separated expertise string to list"""
        if self.expertise:
            return [exp.strip() for exp in self.expertise.split(',')]
        return []
    
    def get_profile_image_url(self):
        """Return profile image URL or None (handled in template)"""
        if self.profile_image:
            return self.profile_image.url
        return None

class MentorshipRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'), 
        ('accepted', 'Accepted'), 
        ('rejected', 'Rejected')
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_mentorship_requests")
    mentor = models.ForeignKey(AlumniProfile, on_delete=models.CASCADE, related_name="received_mentorship_requests")
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self): 
        return f"{self.student.full_name} → {self.mentor.user.full_name} ({self.status})"

# --- FORUM & Q&A ---

class ForumPost(models.Model):
    POST_TYPES = [
        ('Question', 'Question'), 
        ('Discussion', 'Discussion'), 
        ('Announcement', 'Announcement')
    ]
    
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="forum_posts")
    title = models.CharField(max_length=255)
    content = models.TextField()
    image = models.ImageField(upload_to='forum_images/', null=True, blank=True)
    post_type = models.CharField(max_length=20, choices=POST_TYPES, default='Question')
    category = models.ForeignKey(ForumCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="forum_posts")
    tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated tags")
    is_approved = models.BooleanField(default=False)
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self): 
        return self.title

class Reply(models.Model):
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="forum_replies")
    content = models.TextField()
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self): 
        return f"Reply by {self.author.full_name}"

class Question(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="questions")
    views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self): 
        return self.title

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="answers")
    body = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="answers")
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_accepted', 'created_at']
    
    def __str__(self): 
        return f"Answer by {self.author.full_name}"

# --- RESOURCES & OPPORTUNITIES ---

class Resource(models.Model):
    RESOURCE_TYPES = [
        ('guide', '📘 Guide'), 
        ('template', '📝 Template'), 
        ('video', '🎥 Video'), 
        ('article', '📄 Article'), 
        ('course', '🎓 Course'), 
        ('tool', '🛠️ Tool')
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(ResourceCategory, on_delete=models.CASCADE, related_name='resources')
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES, default='guide')
    file = models.FileField(upload_to='resources/', blank=True, null=True)
    external_link = models.URLField(max_length=500, blank=True, null=True)
    is_free = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_featured', '-created_at']
        verbose_name = "Resource"
        verbose_name_plural = "Resources"
    
    def __str__(self): 
        return self.title
    
    def get_display_icon(self):
        """Return emoji icon based on resource type"""
        icon_map = {
            'guide': '📘',
            'template': '📝',
            'video': '🎥',
            'article': '📄',
            'course': '🎓',
            'tool': '🛠️',
        }
        return icon_map.get(self.resource_type, '📌')

class Opportunity(models.Model):
    title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255)
    country = models.CharField(max_length=100, default="Global")
    opportunity_type = models.CharField(max_length=100)
    funding = models.CharField(max_length=100)
    description = models.TextField()
    deadline = models.DateField()
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posted_opportunities")
    url = models.URLField(max_length=500, blank=True, null=True)
    image = models.ImageField(upload_to='opportunity_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    OPPORTUNITY_CATEGORY = [
        ('general', 'General Field Opportunity'),
        ('edtech', 'EdTech Special Opportunity'),
    ]
    
    category = models.CharField(
        max_length=20,
        choices=OPPORTUNITY_CATEGORY,
        default='general',
        help_text="Select whether this is a General or EdTech Special opportunity"
    )
    
    class Meta:
        ordering = ['deadline']
        verbose_name = "Opportunity"
        verbose_name_plural = "Opportunities"
    
    def __str__(self): 
        return self.title

# --- ALUMNI POSTS & MESSAGES (NEW MODELS FOR ALUMNI PAGE) ---

class AlumniPost(models.Model):
    """Posts created by alumni/mentors"""
    author = models.ForeignKey(AlumniProfile, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Alumni Post"
        verbose_name_plural = "Alumni Posts"
    
    def __str__(self):
        return self.title
    
    def comments_count(self):
        return self.comments.count()
    
    def likes_count(self):
        return self.likes.count()

class PostComment(models.Model):
    """Comments on alumni posts"""
    post = models.ForeignKey(AlumniPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alumni_post_comments')
    content = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.full_name} on {self.post.title}"

class PostLike(models.Model):
    """Likes on alumni posts"""
    post = models.ForeignKey(AlumniPost, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alumni_post_likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('post', 'user')
    
    def __str__(self):
        return f"{self.user.full_name} likes {self.post.title}"

class Message(models.Model):
    """Private messages from students to alumni"""
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(AlumniProfile, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=200)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Message: {self.subject[:50]}"