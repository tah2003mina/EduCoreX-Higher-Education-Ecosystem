from django.apps import AppConfig
from django.core.exceptions import AppRegistryNotReady


class MainConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "main"
    verbose_name = "EduCoreX Core"

    def ready(self):
        try:
            import main.signals  # noqa: F401
        except (ImportError, AppRegistryNotReady):
            pass

