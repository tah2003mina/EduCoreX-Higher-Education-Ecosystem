from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm
from .models import Profile, AlumniProfile

User = get_user_model()

# ========== NEW REGISTRATION FORM (ROLE BUTTONS) ==========
class CustomUserRegistrationForm(forms.ModelForm):
    """NEW: Single registration form with role buttons"""
    
    # Basic fields - REMOVED username, using full_name instead
    full_name = forms.CharField(max_length=255, required=True, widget=forms.TextInput(attrs={
        'class': 'form-input',
        'placeholder': 'Enter your full name'
    }))
    
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={
        'class': 'form-input',
        'placeholder': 'example@domain.com'
    }))
    
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-input', 'placeholder': 'Enter password'}),
        min_length=8,
        required=True
    )
    
    confirm_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-input', 'placeholder': 'Confirm password'}),
        required=True
    )
    
    # Role selection - will be handled by hidden input
    role = forms.ChoiceField(
        choices=Profile.ROLE_CHOICES,
        widget=forms.HiddenInput(),
        required=True
    )
    
    # Student fields (conditional)
    university = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'University / Institution'})
    )
    
    department = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Department / Major'})
    )
    
    semester = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Current Semester'})
    )
    
    interests = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={'class': 'form-input', 'placeholder': 'Academic or Professional Interests', 'rows': 3})
    )
    
    # Mentor fields (conditional)
    expertise = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Primary Area of Expertise'})
    )
    
    experience_years = forms.IntegerField(
        required=False,
        widget=forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'Years of Experience', 'min': 0})
    )
    
    organization = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Current Organization'})
    )
    
    mentoring_mode = forms.ChoiceField(
        required=False,
        choices=[('', 'Preferred Mentoring Mode'), ('online', 'Online'), ('offline', 'Offline'), ('both', 'Both')],
        widget=forms.Select(attrs={'class': 'form-input'})
    )
    
    # Alumni fields (conditional)
    grad_year = forms.IntegerField(
        required=False,
        widget=forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'Graduation Year', 'min': 1900, 'max': 2100})
    )
    
    current_company = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Current Company / Organization'})
    )
    
    industry = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Industry Field'})
    )
    
    willing_to_mentor = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'checkbox-input'})
    )
    current_title = forms.CharField(required=False, widget=forms.TextInput(attrs={'placeholder': 'e.g., Software Engineer'}))
    location = forms.CharField(required=False, widget=forms.TextInput(attrs={'placeholder': 'e.g., New York, USA'}))
    class Meta:
        model = User
        fields = ['full_name', 'email']  # Changed from ['username', 'email']
    
    def clean(self):
        cleaned_data = super().clean()
        
        # Password validation
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')
        
        if password and confirm_password and password != confirm_password:
            raise ValidationError("Passwords do not match.")
        
        if password and len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        
        # Role validation
        role = cleaned_data.get('role')
        if not role:
            raise ValidationError("Please select a role.")
        
        # Role-specific validation
        if role == 'student':
            if not cleaned_data.get('university'):
                raise ValidationError("University is required for students.")
            if not cleaned_data.get('department'):
                raise ValidationError("Department is required for students.")
        
        elif role == 'mentor':
            if not cleaned_data.get('expertise'):
                raise ValidationError("Expertise is required for mentors.")
            if not cleaned_data.get('experience_years'):
                raise ValidationError("Years of experience is required for mentors.")
        
        elif role == 'alumni':
            if not cleaned_data.get('grad_year'):
                raise ValidationError("Graduation year is required for alumni.")
            if not cleaned_data.get('current_company'):
                raise ValidationError("Current company is required for alumni.")
        
        # Email uniqueness
        email = cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("A user with this email already exists.")
        
        return cleaned_data
    
    def save(self, commit=True):
        # Create user - USING full_name INSTEAD OF username
        user = User.objects.create_user(
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password'],
            full_name=self.cleaned_data['full_name']  # This is the fix
        )
        
        # Get or create profile
        profile, created = Profile.objects.get_or_create(user=user)
        
        # Update profile with role and role-specific data
        role = self.cleaned_data['role']
        profile.role = role
        
        if role == 'student':
            profile.university = self.cleaned_data['university']
            profile.department = self.cleaned_data['department']
            profile.semester = self.cleaned_data['semester']
            profile.interests = self.cleaned_data['interests']
        
        elif role == 'mentor':
            profile.expertise = self.cleaned_data['expertise']
            profile.experience_years = self.cleaned_data['experience_years']
            profile.organization = self.cleaned_data['organization']
            profile.mentoring_mode = self.cleaned_data['mentoring_mode']
        
        elif role == 'alumni':
            profile.grad_year = self.cleaned_data['grad_year']
            profile.current_company = self.cleaned_data['current_company']
            profile.industry = self.cleaned_data['industry']
            profile.willing_to_mentor = self.cleaned_data.get('willing_to_mentor', False)
        
        if commit:
            profile.save()
            user.save()
        
        return user

# ========== LOGIN FORM ==========
class CustomLoginForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.EmailInput(attrs={
            'class': 'form-input',
            'placeholder': 'Enter your email',
            'id': 'loginEmail'
        })
    )
    
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-input',
            'placeholder': 'Enter your password',
            'id': 'loginPassword'
        })
    )
    
    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('full_name')
        
        # Check if user exists
        if email and not User.objects.filter(email=email).exists():
            raise ValidationError("No account found with this email.")
        
        return cleaned_data
    # forms.py
from django import forms
from .models import AlumniProfile, AlumniPost, Message

class AlumniSearchForm(forms.Form):
    search = forms.CharField(required=False, widget=forms.TextInput(attrs={
        'class': 'alumni-search-input',
        'placeholder': 'Search by name, expertise, or company...'
    }))
    filter = forms.ChoiceField(required=False, choices=[
        ('all', 'All'),
        ('mentors', 'Mentors'),
        ('alumni', 'Alumni'),
        ('posts', 'Posts'),
    ])

class MessageForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = ['subject', 'content']
        widgets = {
            'subject': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Message subject'
            }),
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 5,
                'placeholder': 'Write your message here...'
            }),
        }