# Fresh migration for Announcement model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('donatex', '0008_alter_announcement_ngo'),
    ]

    operations = [
        migrations.CreateModel(
            name='Announcement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=150)),
                ('description', models.TextField()),
                ('image', models.ImageField(blank=True, null=True, upload_to='announcements/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('ngo', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='announcements', to='donatex.ngo')),
            ],
            options={
                'db_table': 'announcements',
                'ordering': ['-created_at'],
            },
        ),
    ]
