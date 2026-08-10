from rest_framework import serializers

from .models import (
    Role,
    User,
    ResourceCategory,
    Resource,
    Question,
    Answer,
    Event,
)


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "description"]


class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "role",
            "bio",
            "profile_image",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("email", "created_at", "updated_at")


class ResourceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceCategory
        fields = ["id", "name", "description"]


class ResourceSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    category = ResourceCategorySerializer(read_only=True)

    class Meta:
        model = Resource
        fields = [
            "id",
            "title",
            "description",
            "file_url",
            "category",
            "uploaded_by",
            "tags",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("uploaded_by", "created_at", "updated_at")


class AnswerSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Answer
        fields = [
            "id",
            "question",
            "answer_body",
            "author",
            "is_accepted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("author", "created_at", "updated_at")


class QuestionSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "title",
            "body",
            "author",
            "views",
            "created_at",
            "updated_at",
            "answers",
        ]
        read_only_fields = ("author", "views", "created_at", "updated_at")


class EventSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "event_date",
            "event_time",
            "venue",
            "event_type",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("created_by", "created_at", "updated_at")

