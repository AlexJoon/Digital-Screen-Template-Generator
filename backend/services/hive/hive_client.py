"""
Hive API Client

Low-level HTTP client for interacting with the Hive REST API.
Documentation: https://developers.hive.com/reference/introduction
"""

import httpx
from typing import Optional, Dict, Any
from dataclasses import dataclass


@dataclass
class HiveConfig:
    """Configuration for Hive API client"""
    api_key: str
    user_id: str
    workspace_id: str
    base_url: str = "https://app.hive.com/api/v1"


class HiveClient:
    """
    Low-level Hive API client.

    Handles authentication and HTTP requests to the Hive REST API.
    All requests require:
    - Header: api_key
    - Query param: user_id
    """

    def __init__(self, config: HiveConfig):
        self.config = config
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def _headers(self) -> Dict[str, str]:
        """Default headers for all requests"""
        return {
            "api_key": self.config.api_key,
            "Content-Type": "application/json"
        }

    def _url(self, endpoint: str) -> str:
        """Build full URL with user_id query param"""
        separator = "&" if "?" in endpoint else "?"
        return f"{self.config.base_url}/{endpoint}{separator}user_id={self.config.user_id}"

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client"""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=60.0)
        return self._client

    async def close(self):
        """Close the HTTP client"""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def test_credentials(self) -> Dict[str, Any]:
        """
        Test API credentials.

        Returns:
            {"status": "success", "message": "User authenticated"}
        """
        client = await self._get_client()
        response = await client.get(
            self._url("testcredentials"),
            headers={"api_key": self.config.api_key}
        )
        response.raise_for_status()
        return response.json()

    async def get_projects(self) -> list:
        """
        Get all projects in the workspace.

        Returns:
            List of project objects
        """
        client = await self._get_client()
        response = await client.get(
            self._url(f"workspaces/{self.config.workspace_id}/projects"),
            headers={"api_key": self.config.api_key}
        )
        response.raise_for_status()
        return response.json()

    async def create_action(
        self,
        project_id: str,
        title: str,
        description: Optional[str] = None,
        assignees: Optional[list] = None,
        deadline: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a new action (task) in a project.

        Args:
            project_id: The project ID to create the action in
            title: Action title
            description: Optional description/notes
            assignees: Optional list of user IDs to assign
            deadline: Optional deadline date (ISO format)

        Returns:
            Created action object with 'id' field
        """
        client = await self._get_client()

        payload = {
            "workspace": self.config.workspace_id,
            "project": project_id,
            "title": title,
        }

        if description:
            payload["description"] = description
        if assignees:
            payload["assignees"] = assignees
        if deadline:
            payload["deadline"] = deadline

        response = await client.post(
            self._url("actions/create"),
            headers=self._headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()

    async def attach_file(
        self,
        action_id: str,
        file_content: bytes,
        filename: str,
        content_type: str
    ) -> Dict[str, Any]:
        """
        Attach a file to an existing action.

        Args:
            action_id: The action ID to attach the file to
            file_content: Binary file content
            filename: Name for the file
            content_type: MIME type of the file

        Returns:
            Attachment object
        """
        client = await self._get_client()

        # Multipart form data for file upload
        files = {
            "file": (filename, file_content, content_type)
        }

        # Remove Content-Type header for multipart
        headers = {"api_key": self.config.api_key}

        response = await client.post(
            self._url(f"actions/{action_id}/attachments"),
            headers=headers,
            files=files
        )
        response.raise_for_status()
        return response.json()

    async def get_action(self, action_id: str) -> Dict[str, Any]:
        """
        Get details of a specific action.

        Args:
            action_id: The action ID

        Returns:
            Action object
        """
        client = await self._get_client()
        response = await client.get(
            self._url(f"actions/{action_id}"),
            headers={"api_key": self.config.api_key}
        )
        response.raise_for_status()
        return response.json()

    async def update_action(
        self,
        action_id: str,
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update an existing action.

        Args:
            action_id: The action ID to update
            updates: Dictionary of fields to update

        Returns:
            Updated action object
        """
        client = await self._get_client()
        response = await client.put(
            self._url(f"actions/{action_id}"),
            headers=self._headers,
            json=updates
        )
        response.raise_for_status()
        return response.json()
