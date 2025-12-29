# GitHub Actions Workflows

## Zip Project Files

This workflow automatically creates a zip archive of the SanuFlix project files.

### Triggers

- **Manual**: Run from the Actions tab in GitHub (workflow_dispatch)
- **Automatic**: Runs on every push to `main` branch
- **Pull Requests**: Runs when PRs are created targeting `main`

### What it does

1. Checks out the repository code
2. Creates a timestamped zip file (e.g., `sanuflix-2025-10-24-123456.zip`)
3. Excludes unnecessary files:
   - `.git` directory
   - `node_modules`
   - `dist` and build folders
   - Cache directories
4. Uploads the zip as a downloadable artifact (available for 30 days)
5. If you push a tag (e.g., `v1.0.0`), it also creates a GitHub Release with the zip

### How to use

#### Manual Trigger:
1. Go to your repository on GitHub
2. Click on "Actions" tab
3. Select "Zip Project Files" workflow
4. Click "Run workflow" button
5. Once complete, download the artifact from the workflow run page

#### Download Artifacts:
1. Go to the workflow run page
2. Scroll to "Artifacts" section at the bottom
3. Click on the artifact name to download the zip file

#### Create a Release with zip:
```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0
```

This will automatically create a GitHub Release with the zip file attached.

