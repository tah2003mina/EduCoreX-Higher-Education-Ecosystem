from django.urls import path
from . import views

urlpatterns = [
    # --- Public Pages ---
    path('', views.index_page, name='index'),
    path('about/', views.about_page, name='about'),
    path('privacy/', views.privacy_page, name='privacy'),
    path('terms/', views.terms_page, name='terms'),
    path('forgot-password/', views.forgot_password_page, name='forgot_password'),

    # --- Auth Pages ---
    path('login/', views.login_page, name='login'),
    path('register/', views.register_page, name='register'),
    path('logout/', views.logout_view, name='logout'),

    # --- Dashboard & AI Features ---
    path('dashboard/', views.dashboard_page, name='dashboard'),
    path('dashboard/student/', views.student_dashboard_view, name='student_dashboard_view'),
    path('dashboard/mentor/', views.mentor_dashboard_view, name='mentor_dashboard_view'),
    path('dashboard/alumni/', views.alumni_dashboard_view, name='alumni_dashboard_view'),
    
    path('ai-assistant/', views.ai_assistant_page, name='ai_assistant'),
    path('api/chat/', views.chat_api, name='chat_api'),

    # --- Core Features ---
    path('resources/', views.resources_page, name='resources'),
    path('forum/', views.forum_page, name='forum'),
    path('settings/', views.settings_page, name='settings'),

    # --- Alumni Pages (Public) ---
    path('alumni/', views.alumni_directory, name='alumni'),  # Public directory
    path('alumni/<int:user_id>/', views.public_profile, name='alumni_detail_view'),
   path('alumni/<int:user_id>/request-mentorship/', views.request_mentorship, name='request_mentorship'),
    path('alumni/<int:user_id>/message/', views.send_message_view, name='send_message_view'),
    path('alumni/posts/', views.alumni_posts_view, name='alumni_posts_view'),
    
    # Public Profile
    path('profile/<int:user_id>/', views.public_profile, name='public_profile'),
    # --- Mentor Profile Management ---
    path('mentor/update-profile/', views.update_mentor_profile, name='update_mentor_profile'),

    # --- Mentor API URLs ---
    path('api/mentor/stats/', views.mentor_stats_api, name='mentor_stats_api'),
    path('api/mentor/mentorship-requests/', views.mentorship_requests_api, name='mentorship_requests_api'),
    path('api/mentor/mentorship-requests/<int:request_id>/accept/', views.accept_mentorship_request, name='accept_mentorship_request'),
    path('api/mentor/mentorship-requests/<int:request_id>/reject/', views.reject_mentorship_request, name='reject_mentorship_request'),
    path('test-csrf/', views.test_csrf, name='test_csrf'),

     path('opportunities/', views.opportunities, name='opportunities'),
    path('opportunities/suggestions/', views.opportunity_suggestions, name='opportunity_suggestions'),
    path('opportunities/edtech/', views.edtech_opportunities, name='edtech_opportunities'),  
]