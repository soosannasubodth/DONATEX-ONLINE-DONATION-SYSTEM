from django.test import TestCase, Client
from django.conf import settings
import jwt

from .models import User, NGO


class AdminApprovalTests(TestCase):
	def setUp(self):
		self.client = Client()
		# create admin user
		self.admin = User.objects.create(
			full_name="Admin User",
			email="admin@example.com",
			password="notused",
			role="admin"
		)

		# create a regular ngo user and NGO profile
		self.ngo_user = User.objects.create(
			full_name="NGO User",
			email="ngo@example.com",
			password="notused",
			role="ngo",
			organization_name="Helping Hands",
			registration_number="REG123",
			address="123 Charity St",
			phone_number="1234567890"
		)

		self.ngo = NGO.objects.create(
			user=self.ngo_user,
			name="Helping Hands",
			description="We help people",
			category="health",
			status="pending"
		)

	def _token_for(self, user):
		token = jwt.encode({"user_id": user.id}, settings.SECRET_KEY, algorithm="HS256")
		if isinstance(token, bytes):
			token = token.decode()
		return token

	def test_admin_can_list_pending_ngos(self):
		token = self._token_for(self.admin)
		resp = self.client.get("/api/admin/ngos/pending/", HTTP_AUTHORIZATION=f"Bearer {token}")
		self.assertEqual(resp.status_code, 200)
		data = resp.json()
		self.assertTrue(isinstance(data, list))
		self.assertEqual(len(data), 1)
		self.assertEqual(data[0]["id"], self.ngo.id)

	def test_admin_can_approve_ngo(self):
		token = self._token_for(self.admin)
		resp = self.client.post(f"/api/admin/ngos/{self.ngo.id}/status/", {"status": "approved"}, content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {token}")
		self.assertEqual(resp.status_code, 200)
		self.ngo.refresh_from_db()
		self.assertEqual(self.ngo.status, "approved")

	def test_non_admin_cannot_access(self):
		token = self._token_for(self.ngo_user)
		resp = self.client.get("/api/admin/ngos/pending/", HTTP_AUTHORIZATION=f"Bearer {token}")
		self.assertIn(resp.status_code, (403, 401))
