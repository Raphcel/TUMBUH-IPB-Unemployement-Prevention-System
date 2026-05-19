import unittest

from pydantic import ValidationError

from app.schemas.user import UserUpdate


class UserSocialLinkValidationTests(unittest.TestCase):
    def test_social_links_add_missing_https(self):
        update = UserUpdate(social_links={
            "github": "github.com/student",
            "website": "portfolio.example.com",
        })

        self.assertEqual(update.social_links["github"], "https://github.com/student")
        self.assertEqual(update.social_links["website"], "https://portfolio.example.com")

    def test_social_links_reject_plain_text(self):
        with self.assertRaises(ValidationError):
            UserUpdate(social_links={"github": "aaa"})

    def test_social_links_reject_wrong_platform_domain(self):
        with self.assertRaises(ValidationError):
            UserUpdate(social_links={"github": "https://linkedin.com/in/student"})

    def test_social_links_remove_empty_values(self):
        update = UserUpdate(social_links={"github": "", "linkedin": "   "})

        self.assertEqual(update.social_links, {})


if __name__ == "__main__":
    unittest.main()
