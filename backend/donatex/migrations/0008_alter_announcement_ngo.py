# Generated migration to make ngo_id nullable

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('donatex', '0007_remove_announcement_target_type_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='announcement',
            name='ngo',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='announcements', to='donatex.ngo'),
        ),
    ]
