from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("donatex", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="NGO",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="donatex.user",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("description", models.TextField()),
                ("category", models.CharField(max_length=100)),
                ("logo", models.ImageField(upload_to="logos/", null=True, blank=True)),
                ("status", models.CharField(default="pending", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "db_table": "ngos",
            },
        ),
        migrations.CreateModel(
            name="Donation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "donor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="donatex.user",
                    ),
                ),
                (
                    "ngo",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="donatex.ngo",
                    ),
                ),
                ("type", models.CharField(max_length=10)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=10, null=True, blank=True)),
                ("items", models.TextField(null=True, blank=True)),
                ("payment_method", models.CharField(max_length=50, null=True, blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "db_table": "donations",
            },
        ),
    ]
