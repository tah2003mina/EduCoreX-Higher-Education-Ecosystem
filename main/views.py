from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.http import JsonResponse
from google import genai
from django.views.decorators.csrf import csrf_exempt
import os 
from django.db import transaction
from django.db.models import Q
from django.core.files.storage import FileSystemStorage
from django.contrib.auth import logout as auth_logout
import json

# Import all models
from .models import (
    AIChatSession, 
    AlumniProfile, 
    MentorshipRequest, 
    Opportunity, 
    Resource, 
    ResourceCategory, 
    ForumPost,
    Profile,
    User,
    AlumniPost,        # Added for alumni page
    Message            # Added for alumni page
)
from .forms import CustomUserRegistrationForm, CustomLoginForm

# ============================================
# PUBLIC PAGES
# ============================================

def index_page(request): 
    return render(request, 'index.html')

def about_page(request): 
    return render(request, 'about.html')

def privacy_page(request): 
    return render(request, 'privacy.html')

def terms_page(request): 
    return render(request, 'terms.html')

def forgot_password_page(request):
    return render(request, 'forgot_password.html')

# ============================================
# ALUMNI DIRECTORY (PUBLIC)
# ============================================
from django.views.decorators.http import require_POST
@login_required
@require_POST
def request_mentorship(request, user_id):
    """Send a mentorship request to a mentor"""
    mentor_user = get_object_or_404(User, id=user_id)
    
    if request.user.id == mentor_user.id:
        messages.error(request, "You cannot request mentorship from yourself")
        return redirect('alumni_detail_view', user_id=user_id)
    
    try:
        mentor_alumni = AlumniProfile.objects.get(user=mentor_user)
        if not mentor_alumni.is_mentor:
            messages.error(request, "This user is not a mentor")
            return redirect('alumni_detail_view', user_id=user_id)
    except AlumniProfile.DoesNotExist:
        messages.error(request, "Mentor profile not found")
        return redirect('alumni_detail_view', user_id=user_id)
    
    # Check if request already exists
    existing_request = MentorshipRequest.objects.filter(
        student=request.user,
        mentor=mentor_alumni
    ).first()
    
    if existing_request:
        if existing_request.status == 'pending':
            messages.warning(request, "You already have a pending request")
        elif existing_request.status == 'accepted':
            messages.info(request, "You are already connected with this mentor")
        return redirect('alumni_detail_view', user_id=user_id)
    
    message = request.POST.get('message', '').strip()
    if not message:
        messages.error(request, "Please write a message")
        return redirect('alumni_detail_view', user_id=user_id)
    
    MentorshipRequest.objects.create(
        student=request.user,
        mentor=mentor_alumni,
        message=message
    )
    messages.success(request, f"Mentorship request sent to {mentor_user.full_name}!")
    
    return redirect('alumni_detail_view', user_id=user_id)
def alumni_directory(request):
    """Public alumni directory page (URL: /alumni/)"""
    # Get filter parameter
    filter_type = request.GET.get('filter', 'all')
    search_query = request.GET.get('search', '')
    
    # Base queryset for profiles
    profiles = Profile.objects.filter(
        Q(role='alumni') | Q(role='mentor')
    ).select_related('user')
    
    # Apply search filter if provided
    if search_query:
        profiles = profiles.filter(
            Q(user__full_name__icontains=search_query) |
            Q(expertise__icontains=search_query) |
            Q(organization__icontains=search_query) |
            Q(current_company__icontains=search_query)
        )
    
    # Apply role filter based on tab
    if filter_type == 'mentors':
        profiles = profiles.filter(role='mentor')
    elif filter_type == 'alumni':
        profiles = profiles.filter(role='alumni')
    # 'all' shows both alumni and mentors
    
    # Get posts (only needed when posts tab is active)
    posts = []
    if filter_type == 'posts':
        try:
            posts = AlumniPost.objects.filter(
                is_published=True,
                author__user__profile__role__in=['alumni', 'mentor']
            ).select_related('author__user').order_by('-created_at')[:10]
        except (ImportError, AttributeError):
            posts = []
    
    context = {
        'profiles': profiles,
        'posts': posts,
        'current_filter': filter_type,
        'search_query': search_query,
    }
    
    return render(request, 'alumni.html', context)
def public_profile(request, user_id):
    """Public profile page for alumni/mentors"""
    user = get_object_or_404(User, id=user_id)
    profile = get_object_or_404(Profile, user=user)
    
    if profile.role not in ['alumni', 'mentor']:
        messages.error(request, "This user is not an alumni or mentor")
        return redirect('alumni_directory')
    
    # Get alumni profile data
    try:
        alumni_profile = AlumniProfile.objects.get(user=user)
    except AlumniProfile.DoesNotExist:
        alumni_profile = None
    
    # Get user's posts
    user_posts = []
    if alumni_profile:
        user_posts = AlumniPost.objects.filter(
            author=alumni_profile,
            is_published=True
        ).order_by('-created_at')[:4]
    
    context = {
        'profile_user': user,
        'profile': profile,
        'alumni_profile': alumni_profile,
        'user_posts': user_posts,
        'is_own_profile': request.user.id == user_id if request.user.is_authenticated else False,
    }
    return render(request, 'profile.html', context)


# ============================================
# NEW ALUMNI DETAIL AND MESSAGING VIEWS
# ============================================

def alumni_detail_view(request, profile_id):
    """Detailed view of a single alumni profile"""
    alumni = get_object_or_404(
        AlumniProfile.objects.select_related('user'), 
        id=profile_id
    )
    
    # Get alumni's posts
    alumni_posts = AlumniPost.objects.filter(
        author=alumni, 
        is_published=True
    ).order_by('-created_at')
    
    context = {
        'alumni': alumni,
        'alumni_posts': alumni_posts,
    }
    
    return render(request, 'alumni_detail.html', context)

@login_required
def send_message_view(request, profile_id):
    """Send a private message to an alumni"""
    recipient = get_object_or_404(AlumniProfile, id=profile_id)
    
    # Check if user is trying to message themselves
    if request.user == recipient.user:
        messages.error(request, "You cannot send a message to yourself.")
        return redirect('alumni_detail_view', profile_id=profile_id)
    
    if request.method == 'POST':
        from .forms import MessageForm
        form = MessageForm(request.POST)
        if form.is_valid():
            message = form.save(commit=False)
            message.sender = request.user
            message.recipient = recipient
            message.save()
            
            messages.success(
                request, 
                f'Your message has been sent to {recipient.user.full_name}!'
            )
            return redirect('alumni_detail_view', profile_id=profile_id)
    else:
        from .forms import MessageForm
        form = MessageForm()
    
    context = {
        'form': form,
        'recipient': recipient,
    }
    
    return render(request, 'send_message.html', context)

@login_required
def alumni_posts_view(request):
    """View all alumni posts"""
    posts = AlumniPost.objects.filter(is_published=True).select_related(
        'author__user'
    ).order_by('-created_at')
    
    context = {
        'posts': posts,
    }
    
    return render(request, 'alumni_posts.html', context)
def public_profile(request, user_id):
    """Public profile page for alumni/mentors with posts and messaging"""
    user = get_object_or_404(User, id=user_id)
    profile = get_object_or_404(Profile, user=user)
    
    if profile.role not in ['alumni', 'mentor']:
        messages.error(request, "This user is not an alumni or mentor")
        return redirect('alumni_directory')
    
    # Get alumni profile data
    try:
        alumni_profile = AlumniProfile.objects.get(user=user)
    except AlumniProfile.DoesNotExist:
        alumni_profile = None
    
    # Get user's posts/articles
    try:
        # If you have a Post model (you mentioned posts in alumni.html)
        from .models import Post  # Make sure to import this at the top
        user_posts = Post.objects.filter(
            author=user
        ).order_by('-created_at')[:10]  # Get latest 10 posts
    except (ImportError, AttributeError):
        user_posts = []
    
    # Check if the current user can message this profile
    can_message = False
    if request.user.is_authenticated:
        # Don't allow messaging yourself
        if request.user.id != user_id:
            can_message = True
    
    context = {
        'profile_user': user,
        'profile': profile,
        'alumni_profile': alumni_profile,
        'user_posts': user_posts,
        'can_message': can_message,
    }
    return render(request, 'profile.html', context)

# ============================================
# AUTHENTICATION
# ============================================
from django.views.decorators.csrf import csrf_protect
from django.http import HttpResponse

def test_csrf(request):
    if request.method == 'POST':
        return HttpResponse("CSRF is working!")
    return render(request, 'test_csrf.html')

def get_role_based_redirect(user):
    try:
        profile = Profile.objects.get(user=user)
        if profile.role == 'student':
            return 'student_dashboard_view'
        elif profile.role == 'mentor':
            return 'mentor_dashboard_view'
        elif profile.role == 'alumni':
            return 'alumni_dashboard_view'
    except Profile.DoesNotExist:
        pass
    return 'dashboard'

from django.views.decorators.csrf import ensure_csrf_cookie
@ensure_csrf_cookie 
def login_page(request):
    if request.method == 'POST':
        email = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            target_url = get_role_based_redirect(user)
            messages.success(request, f"Welcome back, {user.full_name}!")
            return redirect(target_url)
        else:
            messages.error(request, "Invalid email or password.")
    
    form = CustomLoginForm()
    return render(request, 'login.html', {'form': form})

def register_page(request):
    if request.method == 'POST':
        form = CustomUserRegistrationForm(request.POST)
        
        if form.is_valid():
            try:
                user = form.save()
                selected_role = request.POST.get('role')
                
                transaction.commit()
                
                try:
                    profile = Profile.objects.get(user=user)
                except Profile.DoesNotExist:
                    profile = Profile.objects.create(user=user, role=selected_role)
                
                profile.role = selected_role
                profile.semester = request.POST.get('semester')
                profile.department = request.POST.get('department')
                profile.university = request.POST.get('university')
                profile.interests = request.POST.get('interests')
                profile.expertise = request.POST.get('expertise')
                profile.experience_years = request.POST.get('experience_years') or None
                profile.organization = request.POST.get('organization')
                profile.mentoring_mode = request.POST.get('mode')
                profile.grad_year = request.POST.get('grad_year') or None
                profile.current_company = request.POST.get('current_company')
                profile.industry = request.POST.get('industry')
                profile.save()

                if selected_role in ['alumni', 'mentor']:
                    AlumniProfile.objects.create(
                        user=user,
                        is_mentor=(selected_role == 'mentor'),
                        graduation_year=profile.grad_year or 2024,
                        current_company=profile.current_company or "",
                        industry=profile.industry or "",
                        current_title=request.POST.get('current_title') or "Alumni",
                        location=request.POST.get('location') or "Not specified",
                        mentorship_focus=profile.expertise or "",
                        monthly_slots=2, 
                        bio_summary="Welcome! Please update your professional summary in settings.",
                        has_success_story=False,
                        linkedin_url=""
                    )

                messages.success(request, f'Registration Successful! Welcome to the {selected_role.capitalize()} community.')
                return redirect('login')
                
            except Exception as e:
                messages.error(request, f'Registration error: {str(e)}')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        form = CustomUserRegistrationForm()
    
    return render(request, 'register.html', {'form': form})

def logout_view(request):
    auth_logout(request)
    messages.success(request, "You have been logged out successfully.")
    return redirect('login')

# ============================================
# DASHBOARD VIEWS (ROLE-BASED)
# ============================================

def student_dashboard_view(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        profile = Profile.objects.get(user=request.user)
        if profile.role != 'student':
            if profile.role == 'mentor':
                return redirect('mentor_dashboard_view')
            elif profile.role == 'alumni':
                return redirect('alumni_dashboard_view')
    except Profile.DoesNotExist:
        pass
    
    return render(request, 'dashboard.html', {
        'user': request.user,
        'role': 'student'
    })

@login_required
def alumni_dashboard_view(request):
    """Alumni dashboard - for logged-in alumni and mentors"""
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        profile = Profile.objects.get(user=request.user)
        if profile.role not in ['alumni', 'mentor']:
            messages.warning(request, 'Access restricted to alumni and mentors only.')
            return redirect('student_dashboard_view')
    except Profile.DoesNotExist:
        messages.error(request, 'Profile not found.')
        return redirect('dashboard')
    
    try:
        alumni_profile = AlumniProfile.objects.get(user=request.user)
    except AlumniProfile.DoesNotExist:
        alumni_profile = None
    
    context = {
        'user': request.user,
        'profile': profile,
        'alumni_profile': alumni_profile,
        'role': profile.role
    }
    return render(request, 'alumni_dashboard.html', context)

@login_required
def mentor_dashboard_view(request):
    """Mentor dashboard - accessible only to mentor role"""
    try:
        profile = Profile.objects.get(user=request.user)
        if profile.role != 'mentor':
            messages.warning(request, 'Access restricted to mentors only.')
            if profile.role == 'student':
                return redirect('student_dashboard_view')
            elif profile.role == 'alumni':
                return redirect('alumni_dashboard_view')
    except Profile.DoesNotExist:
        messages.error(request, 'Profile not found.')
        return redirect('dashboard')
    
    try:
        alumni_profile = AlumniProfile.objects.get(user=request.user)
    except AlumniProfile.DoesNotExist:
        alumni_profile = None
    
    if alumni_profile:
        pending_requests = MentorshipRequest.objects.filter(
            mentor=alumni_profile,
            status='pending'
        ).select_related('student')[:5]
        
        accepted_mentees = MentorshipRequest.objects.filter(
            mentor=alumni_profile,
            status='accepted'
        ).select_related('student')[:5]
    else:
        pending_requests = []
        accepted_mentees = []
    
    total_mentees = accepted_mentees.count() if alumni_profile else 0
    pending_count = pending_requests.count() if alumni_profile else 0
    
    context = {
        'user': request.user,
        'profile': profile,
        'alumni_profile': alumni_profile,
        'pending_requests': pending_requests,
        'accepted_mentees': accepted_mentees,
        'total_mentees': total_mentees,
        'pending_count': pending_count,
        'role': 'mentor'
    }
    return render(request, 'mentor_dashboard.html', context)

@login_required
def dashboard_page(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        profile = Profile.objects.get(user=request.user)
        if profile.role == 'student':
            return redirect('student_dashboard_view')
        elif profile.role == 'mentor':
            return redirect('mentor_dashboard_view')
        elif profile.role == 'alumni':
            return redirect('alumni_dashboard_view')
    except Profile.DoesNotExist:
        pass
    
    return render(request, 'dashboard.html')

# ============================================
# AI ASSISTANT
# ============================================

@login_required
def ai_assistant_page(request):
    history = AIChatSession.objects.filter(
        user=request.user
    ).order_by('-created_at')[:10]
    return render(request, 'ai_assistant.html', {'history': history})

import ollama
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import AIChatSession

@csrf_exempt
@login_required
def chat_api(request):
    if request.method == "POST":
        user_message = request.POST.get("message")
        
        try:
            # Get previous chats for context
            past_chats = AIChatSession.objects.filter(
                user=request.user
            ).order_by("-created_at")[:5]

            # Build conversation history
            messages = []
            for chat in reversed(past_chats):
                messages.append({"role": "user", "content": chat.query})
                messages.append({"role": "assistant", "content": chat.response})
            
            # Add current message
            messages.append({"role": "user", "content": user_message})

            # Get response from local Ollama
            response = ollama.chat(
                model='llama3.2',  # Choose your model
                messages=messages,
                options={
                    'temperature': 0.7,
                    'num_predict': 500,
                }
            )
            
            ai_text = response['message']['content']

            # Save to database
            AIChatSession.objects.create(
                user=request.user,
                query=user_message,
                response=ai_text
            )

            return JsonResponse({"status": "success", "response": ai_text})

        except Exception as e:
            return JsonResponse({
                "status": "error", 
                "message": str(e)
            }, status=500)
    
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=405)

# ============================================
# CORE FEATURES
# ============================================

def resources_page(request):
    categories = ResourceCategory.objects.all().prefetch_related('resources')
    featured_resources = Resource.objects.filter(is_featured=True)[:6]
    context = {
        'categories': categories,
        'featured_resources': featured_resources,
    }
    return render(request, 'resources.html', context)

@login_required
def forum_page(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')
        post_type = request.POST.get('post_type', 'Question')
        is_anonymous = request.POST.get('is_anonymous') == 'on'
        image = request.FILES.get('image')
        
        if title and content:
            ForumPost.objects.create(
                author=request.user,
                title=title,
                content=content,
                post_type=post_type,
                image=image,
                is_anonymous=is_anonymous
            )
            return redirect('forum')

    posts = ForumPost.objects.all().order_by('-created_at')
    selected_type = request.GET.get('type')
    if selected_type:
        posts = posts.filter(post_type=selected_type)
        
    return render(request, 'forum.html', {
        'posts': posts,
        'post_types': ForumPost.POST_TYPES,
        'selected_type': selected_type,
    })

# In your views.py - Update the opportunity_suggestions function
from django.shortcuts import render
from django.db.models import Q
from django.http import JsonResponse
from .models import Opportunity

def opportunities(request):
    # Get search query
    search_query = request.GET.get('search', '')
    
    # Base queryset
    opportunities_list = Opportunity.objects.all()
    
    # Get EdTech Special opportunities
    edtech_opportunities = opportunities_list.filter(category='edtech')
    
    # Apply search filter if provided
    if search_query:
        opportunities_list = opportunities_list.filter(
            Q(title__icontains=search_query) |
            Q(organization__icontains=search_query) |
            Q(country__icontains=search_query) |
            Q(description__icontains=search_query)
        )
    
    context = {
        'opportunities': opportunities_list,
        'edtech_opportunities': edtech_opportunities,
        'search_query': search_query,
    }
    
    return render(request, 'opportunities.html', context)

# Updated suggestion view with faster country response
def opportunity_suggestions(request):
    query = request.GET.get('q', '').strip()
    suggestions = []
    
    if query and len(query) >= 1:  # Start suggesting from 1 character
        query_lower = query.lower()
        
        # Get unique countries that match the query (fastest response)
        matching_countries = Opportunity.objects.filter(
            country__icontains=query_lower
        ).values_list('country', flat=True).distinct()[:3]  # Top 3 matching countries
        
        for country in matching_countries:
            suggestions.append({
                'value': country,
                'label': f"📍 {country} (Country)",
                'type': 'country',
                'icon': '🌍'
            })
        
        # Get EdTech opportunities if query relates to EdTech
        if query_lower in ['ed', 'edtech', 'education', 'educational']:
            edtech_opps = Opportunity.objects.filter(
                category='edtech'
            )[:3]  # Top 3 EdTech opportunities
            
            for opp in edtech_opps:
                suggestions.append({
                    'value': opp.title,
                    'label': f"💻 {opp.title} (EdTech Special)",
                    'type': 'edtech',
                    'icon': '🔬'
                })
        
        # Get organization matches
        matching_orgs = Opportunity.objects.filter(
            organization__icontains=query_lower
        ).values_list('organization', flat=True).distinct()[:2]
        
        for org in matching_orgs:
            suggestions.append({
                'value': org,
                'label': f"🏛️ {org} (University/Organization)",
                'type': 'organization',
                'icon': '🏛️'
            })
        
        # Get title matches (limit to 2)
        matching_titles = Opportunity.objects.filter(
            title__icontains=query_lower
        )[:2]
        
        for opp in matching_titles:
            suggestions.append({
                'value': opp.title,
                'label': f"🎓 {opp.title}",
                'type': 'title',
                'icon': '📚'
            })
    
    return JsonResponse({'suggestions': suggestions[:8]})  # Limit total suggestions

def edtech_opportunities(request):
    """
    View for displaying only EdTech opportunities
    """
    edtech_opportunities = Opportunity.objects.filter(category='edtech')
    
    context = {
        'opportunities': edtech_opportunities,
        'edtech_opportunities': edtech_opportunities,  # This will show the special section
        'search_query': '',
    }
    
    return render(request, 'opportunities.html', context)

@login_required
def settings_page(request): 
    return render(request, 'settings.html')

# ============================================
# MENTOR PROFILE MANAGEMENT
# ============================================

@login_required
def update_mentor_profile(request):
    if request.method == 'POST':
        try:
            profile = Profile.objects.get(user=request.user)
            
            profile.expertise = request.POST.get('expertise', profile.expertise)
            profile.experience_years = request.POST.get('experience_years', profile.experience_years)
            profile.organization = request.POST.get('organization', profile.organization)
            profile.mentoring_mode = request.POST.get('mentoring_mode', profile.mentoring_mode)
            profile.bio = request.POST.get('bio', profile.bio)
            
            if 'profile_image' in request.FILES:
                profile_image = request.FILES['profile_image']
                fs = FileSystemStorage()
                filename = fs.save(f'profiles/{profile_image.name}', profile_image)
                profile.profile_image = filename
            
            profile.save()
            
            if 'full_name' in request.POST:
                request.user.full_name = request.POST['full_name']
                request.user.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Profile updated successfully',
                })
            else:
                messages.success(request, 'Profile updated successfully')
                return redirect('mentor_dashboard_view')
                
        except Exception as e:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': str(e)}, status=400)
            else:
                messages.error(request, f'Error updating profile: {str(e)}')
                return redirect('mentor_dashboard_view')
    
    return JsonResponse({'error': 'Invalid request'}, status=400)

# ============================================
# API VIEWS FOR MENTOR DASHBOARD
# ============================================

@login_required
def mentor_stats_api(request):
    try:
        profile = Profile.objects.get(user=request.user)
        if profile.role != 'mentor':
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        alumni_profile = AlumniProfile.objects.get(user=request.user)
        pending_requests = MentorshipRequest.objects.filter(
            mentor=alumni_profile,
            status='pending'
        ).count()
        
        stats = {
            'mentee_count': MentorshipRequest.objects.filter(
                mentor=alumni_profile,
                status='accepted'
            ).count(),
            'content_count': 0,
            'course_count': 0,
            'request_count': pending_requests,
        }
        return JsonResponse(stats)
        
    except (Profile.DoesNotExist, AlumniProfile.DoesNotExist):
        return JsonResponse({'error': 'Profile not found'}, status=404)

@login_required
def mentorship_requests_api(request):
    try:
        profile = Profile.objects.get(user=request.user)
        if profile.role != 'mentor':
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        alumni_profile = AlumniProfile.objects.get(user=request.user)
        requests = MentorshipRequest.objects.filter(
            mentor=alumni_profile,
            status='pending'
        ).select_related('student')
        
        requests_data = [{
            'id': req.id,
            'student_name': req.student.full_name,
            'student_email': req.student.email,
            'message': req.message,
            'created_at': req.created_at.strftime('%b %d, %Y'),
            'status': req.status
        } for req in requests]
        
        return JsonResponse(requests_data, safe=False)
        
    except (Profile.DoesNotExist, AlumniProfile.DoesNotExist):
        return JsonResponse([], safe=False)

@login_required
def accept_mentorship_request(request, request_id):
    if request.method == 'POST':
        try:
            mentorship_request = MentorshipRequest.objects.get(id=request_id)
            if mentorship_request.mentor.user != request.user:
                return JsonResponse({'error': 'Permission denied'}, status=403)
            
            mentorship_request.status = 'accepted'
            mentorship_request.save()
            return JsonResponse({'success': True, 'message': 'Request accepted'})
            
        except MentorshipRequest.DoesNotExist:
            return JsonResponse({'error': 'Request not found'}, status=404)
    return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required
def reject_mentorship_request(request, request_id):
    if request.method == 'POST':
        try:
            mentorship_request = MentorshipRequest.objects.get(id=request_id)
            if mentorship_request.mentor.user != request.user:
                return JsonResponse({'error': 'Permission denied'}, status=403)
            
            mentorship_request.status = 'rejected'
            mentorship_request.save()
            return JsonResponse({'success': True, 'message': 'Request rejected'})
            
        except MentorshipRequest.DoesNotExist:
            return JsonResponse({'error': 'Request not found'}, status=404)
    return JsonResponse({'error': 'Invalid request'}, status=400)