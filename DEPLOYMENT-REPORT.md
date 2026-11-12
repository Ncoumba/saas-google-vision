# Deployment report

Date: November 12, 2026 (America/Los_Angeles)

## Live application

- Public URL: https://g21-express-20261022-vk.uc.r.appspot.com
- Project: `g21-express-20261022-vk`
- Service: `default`
- Version: `vision-20261112-01` (100% of public traffic)
- Version URL: https://vision-20261112-01-dot-g21-express-20261022-vk.uc.r.appspot.com
- Environment: App Engine Standard, Node.js 24, F1, maximum one instance.
- Existing App Engine region: `us-central`. No App Engine application was created and no region was changed.
- Cloud Build: `5150c878-3ff6-4725-9ee6-4673df09150d`, region `us-central1`, status SUCCESS.
- Previous version `20261023t165415` was preserved and receives zero public traffic.

## Repository and files

The workspace already contained a clean clone of https://github.com/Ncoumba/saas-google-vision.git.
Local HEAD and remote HEAD matched commit `54002a1ce823d02d95fb2995f2347c8a706e2b93`.
The existing clone was inspected and reused without overwriting working files.

| File | Purpose |
| --- | --- |
| `server.js` | Express server, Multer in-memory uploads with a 5 MiB limit, JPEG/PNG/WebP filtering, Vision label detection, escaped HTML results, and upload/error handling. Listens on `process.env.PORT` or 8080. |
| `public/index.html` | Multipart image upload form posting field `pic` to `/analyze`. |
| `package.json` | Express, Multer, Vision client dependencies; `npm start` runs `node server.js`. |
| `package-lock.json` | Locked dependency versions for installation. |
| `app.yaml` | Node.js 24 Standard runtime, F1 instance class, maximum one instance. |
| `.gitignore` | Excludes dependencies, environment files, logs, and named credential-file patterns from Git. |
| `.gcloudignore` | Excludes dependencies, Git metadata, environment files, and logs from deployment. The actual upload list was inspected and contained no credentials. |

No existing source, dependency, or configuration file was changed during deployment.
Only this report was added at that stage; no commit or push was made during the initial deployment task.
The subsequent GitHub publication update adds `README.md` and includes this report with the deployed application source.

## Authentication and Google Cloud setup

- The active CLI account was already authenticated and the active project was already `g21-express-20261022-vk`.
- Billing was verified as enabled.
- Existing user Application Default Credentials were found outside the repository.
- ADC quota project was already `g21-express-20261022-vk`; no change was necessary.
- ADC access-token refresh succeeded. The token was captured without being displayed.
- `GOOGLE_APPLICATION_CREDENTIALS` was unset, allowing normal ADC discovery.
- Enabled Cloud Vision API (`vision.googleapis.com`).
- Confirmed App Engine Admin (`appengine.googleapis.com`) and Cloud Build (`cloudbuild.googleapis.com`) were enabled.
- The deployed application uses the existing App Engine service account, `g21-express-20261022-vk@appspot.gserviceaccount.com`, via managed credentials.
- That account already had the Editor role. No IAM permissions were added or removed.
- No credential, API key, or service-account key file was created, hardcoded, uploaded, committed, or printed.

Google documents [Node.js runtime behavior](https://docs.cloud.google.com/appengine/docs/standard/nodejs/runtime) and [Node.js 24 general availability](https://docs.cloud.google.com/appengine/docs/standard/nodejs/release-notes).
The existing `app.yaml` was compatible: the runtime supports Node.js 24, `npm start` starts the app, and the server honors `PORT`.
Multer stores uploaded bytes in memory and does not require writable application directories.

## Verification

1. `npm install` completed successfully without changing the lockfile. npm reported a protobufjs install-script approval notice; installation, local Vision calls, Cloud Build, and deployed Vision calls all succeeded without changing script permissions.
2. `npm start` successfully started the server on http://localhost:8080. Local Node.js was v26.8.2; the deployed runtime was independently confirmed as Node.js 24.
3. The local upload form returned HTTP 200.
4. Downloaded Google's public [sample cat image](https://storage.googleapis.com/cloud-samples-data/vision/label/wakeupcat.jpg), 64,892 bytes, into a temporary verification directory.
5. Multipart upload to local `/analyze` returned HTTP 200 and ten labels with confidence scores.
6. Deployed a new version without promoting it or stopping the prior version.
7. The new version's upload form and multipart upload both returned HTTP 200 and labels.
8. Switched 100% of default-service traffic to the verified new version.
9. The final public URL's upload form and multipart upload both returned HTTP 200 and labels.
10. Verified the live traffic allocation, SERVING status, Node.js 24 runtime, and all three required enabled APIs.

The three successful image uploads (local, version URL, final public URL) returned:

| Label | Confidence |
| --- | --- |
| Cat | 99.2% |
| Felidae | 98.0% |
| Felinae | 96.6% |
| Carnivores | 95.7% |
| Facial expression | 94.5% |
| Tooth | 93.4% |
| Snout | 90.0% |
| Whiskers | 86.3% |
| Tongue | 81.3% |
| Internet meme | 79.2% |

HTTP checks used PowerShell and curl, including the same multipart form request a browser sends.
Temporary artifacts are in `%TEMP%\saas-google-vision-verification`: the sample image and HTML responses.
The local npm server was left running for continued use.

## Errors diagnosed

- Initial sandboxed gcloud commands could not write their credential database/logs outside the workspace. Retried with approved access to the existing gcloud configuration; authentication and project inspection succeeded.
- The sandboxed sample-image download failed to connect to Google Cloud Storage. Retried with approved network access and downloaded the image successfully.
- The first local Vision upload, with the server under the restricted sandbox, timed out after 60 seconds without a response. ADC refresh independently succeeded. Stopped that server using Ctrl+C, restarted the identical app with approved network access, and repeated the identical upload successfully. No code fix was applied.
- A global Cloud Build listing returned no rows; listing the App Engine build region `us-central1` showed the successful build.

## Final architecture

Browser → Google App Engine → Node.js / Express → Multer → Google Cloud Vision API → labels + confidence scores → browser

App Engine serves the Express application. Express serves the upload form, and Multer reads a selected image into memory. The Vision client authenticates with the managed App Engine service account and sends the image bytes to label detection. Express formats the returned labels and confidence scores into HTML for the browser. Local development uses user ADC instead of the App Engine service account. No database or permanent image storage is used.

## 30-second presentation script

“This project lets users upload an image and see what Google Cloud Vision recognizes. The browser sends the image to a Node.js and Express app hosted on Google App Engine. Multer handles the upload in memory, and the app sends the image to Vision for label detection. The results page shows detected labels and confidence scores. Authentication uses Google's managed credentials. I verified the full upload flow locally and on the deployed public website.”

## Command log

The following blocks record every shell invocation submitted during setup, including failed attempts and retries, in submission order. Commands within each block are exactly as submitted. Independent checks sometimes ran concurrently. Asynchronous process-output polling did not run additional shell commands. The first npm server was stopped by sending Ctrl+C through process control; the second was left running. Report creation used the file-editing tool.

### Invocation 1

```powershell
Get-Location; Get-ChildItem -Force | Select-Object Mode,Name; git status --short; git remote -v
```

### Invocation 2

```powershell
$paths = @('C:\AGENTS.md','C:\Users\AGENTS.md','C:\Users\venka\AGENTS.md','C:\Users\venka\OneDrive\AGENTS.md','C:\Users\venka\OneDrive\Desktop\AGENTS.md','C:\Users\venka\OneDrive\Desktop\Masters\AGENTS.md','C:\Users\venka\OneDrive\Desktop\Masters\Web Systems\AGENTS.md'); foreach ($p in $paths) { if (Test-Path -LiteralPath $p) { Write-Output $p; Get-Content -LiteralPath $p } }; rg --files -g AGENTS.md -g '!node_modules' -g '!.git' -g '!package-lock.json'; Get-Command node,npm,gcloud,git -ErrorAction SilentlyContinue | Select-Object Name,Source
```

### Invocation 3

```powershell
git log -1 --oneline; git ls-files; Get-Content package.json,app.yaml,server.js,.gitignore,.gcloudignore; rg --files public; Get-Content public\*; node --version; npm --version; gcloud --version
```

### Invocation 4

```powershell
gcloud config list --format=json; gcloud auth list --format=json; gcloud app describe --project=g21-express-20261022-vk --format=json
```

### Invocation 5

```powershell
gcloud services list --enabled --project=g21-express-20261022-vk --format='value(config.name)'; gcloud billing projects describe g21-express-20261022-vk --format=json; if ($env:GOOGLE_APPLICATION_CREDENTIALS) { Write-Output 'GOOGLE_APPLICATION_CREDENTIALS is set (value hidden)' } else { Write-Output 'GOOGLE_APPLICATION_CREDENTIALS is unset' }; $adcPath = Join-Path $env:APPDATA 'gcloud\application_default_credentials.json'; if (Test-Path -LiteralPath $adcPath) { $adc = Get-Content -LiteralPath $adcPath -Raw | ConvertFrom-Json; [pscustomobject]@{exists=$true;type=$adc.type;quota_project_id=$adc.quota_project_id} | ConvertTo-Json } else { Write-Output 'No default ADC file exists' }
```

### Invocation 6

```powershell
gcloud auth list --format=json; gcloud app describe --project=g21-express-20261022-vk --format=json; gcloud services list --enabled --project=g21-express-20261022-vk --format='value(config.name)'; gcloud billing projects describe g21-express-20261022-vk --format=json
```

### Invocation 7

```powershell
npm install
```

### Invocation 8

```powershell
git ls-remote origin HEAD; gcloud app services list --project=g21-express-20261022-vk --format=json; gcloud app versions list --project=g21-express-20261022-vk --format=json
```

### Invocation 9

```powershell
gcloud services enable vision.googleapis.com appengine.googleapis.com cloudbuild.googleapis.com --project=g21-express-20261022-vk --quiet
```

### Invocation 10

```powershell
npm start
```

### Invocation 11

```powershell
$testDir = Join-Path $env:TEMP 'saas-google-vision-verification'; New-Item -ItemType Directory -Path $testDir -Force | Out-Null; curl.exe --fail --silent --show-error --location --max-time 60 'https://storage.googleapis.com/cloud-samples-data/vision/label/wakeupcat.jpg' --output (Join-Path $testDir 'wakeupcat.jpg'); if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; Get-Item -LiteralPath (Join-Path $testDir 'wakeupcat.jpg') | Select-Object Name,Length; $response = Invoke-WebRequest -Uri 'http://localhost:8080' -UseBasicParsing -TimeoutSec 30; [pscustomobject]@{StatusCode=$response.StatusCode;UploadForm=($response.Content -match 'enctype="multipart/form-data"')} | ConvertTo-Json
```

### Invocation 12

```powershell
git status --short; git diff -- package-lock.json; gcloud meta list-files-for-upload; gcloud projects get-iam-policy g21-express-20261022-vk --flatten='bindings[].members' --filter='bindings.members:serviceAccount:g21-express-20261022-vk@appspot.gserviceaccount.com' --format='table(bindings.role,bindings.members)'
```

### Invocation 13

```powershell
$testDir = Join-Path $env:TEMP 'saas-google-vision-verification'; New-Item -ItemType Directory -Path $testDir -Force | Out-Null; curl.exe --fail --silent --show-error --location --max-time 60 'https://storage.googleapis.com/cloud-samples-data/vision/label/wakeupcat.jpg' --output (Join-Path $testDir 'wakeupcat.jpg'); if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; Get-Item -LiteralPath (Join-Path $testDir 'wakeupcat.jpg') | Select-Object Name,Length; $response = Invoke-WebRequest -Uri 'http://localhost:8080' -UseBasicParsing -TimeoutSec 30; [pscustomobject]@{StatusCode=$response.StatusCode;UploadForm=($response.Content -match 'enctype="multipart/form-data"')} | ConvertTo-Json
```

### Invocation 14

```powershell
$testDir = Join-Path $env:TEMP 'saas-google-vision-verification'; $imagePath = Join-Path $testDir 'wakeupcat.jpg'; $outputPath = Join-Path $testDir 'local-results.html'; curl.exe --silent --show-error --max-time 60 --form "pic=@$imagePath;type=image/jpeg" 'http://localhost:8080/analyze' --output $outputPath --write-out 'HTTP %{http_code}\n'; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; $html = Get-Content -LiteralPath $outputPath -Raw; if ($html -match 'Google Cloud Vision Results' -and $html -match '\d+\.\d% confidence') { [regex]::Matches($html,'<strong>([^<]+)</strong>\s*[^\d<]*([\d.]+)% confidence') | ForEach-Object { '{0}: {1}%' -f $_.Groups[1].Value,$_.Groups[2].Value } } else { Write-Output $html; exit 1 }
```

### Invocation 15

```powershell
$adcToken = gcloud auth application-default print-access-token; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; if ([string]::IsNullOrWhiteSpace($adcToken)) { throw 'ADC returned no access token' }; Write-Output 'ADC refresh succeeded (token hidden)'; Remove-Variable adcToken
```

### Invocation 16

```powershell
npm start
```

### Invocation 17

```powershell
$testDir = Join-Path $env:TEMP 'saas-google-vision-verification'; $imagePath = Join-Path $testDir 'wakeupcat.jpg'; $outputPath = Join-Path $testDir 'local-results.html'; curl.exe --silent --show-error --max-time 60 --form "pic=@$imagePath;type=image/jpeg" 'http://localhost:8080/analyze' --output $outputPath --write-out 'HTTP %{http_code}\n'; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; $html = Get-Content -LiteralPath $outputPath -Raw; if ($html -match 'Google Cloud Vision Results' -and $html -match '\d+\.\d% confidence') { [regex]::Matches($html,'<strong>([^<]+)</strong>\s*[^\d<]*([\d.]+)% confidence') | ForEach-Object { '{0}: {1}%' -f $_.Groups[1].Value,$_.Groups[2].Value } } else { Write-Output $html; exit 1 }
```

### Invocation 18

```powershell
gcloud app deploy app.yaml --project=g21-express-20261022-vk --version=vision-20261112-01 --no-promote --no-stop-previous-version --quiet
```

### Invocation 19

```powershell
gcloud builds list --project=g21-express-20261022-vk --limit=1 --format='table(id,status,createTime,logUrl)'
```

### Invocation 20

```powershell
gcloud builds list --project=g21-express-20261022-vk --region=us-central1 --limit=1 --format='table(id,status,createTime,logUrl)'
```

### Invocation 21

```powershell
$baseUrl = 'https://vision-20261112-01-dot-g21-express-20261022-vk.uc.r.appspot.com'; $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 60; [pscustomobject]@{URL=$baseUrl;StatusCode=$response.StatusCode;UploadForm=($response.Content -match 'enctype="multipart/form-data"')} | ConvertTo-Json; $testDir = Join-Path $env:TEMP 'saas-google-vision-verification'; $imagePath = Join-Path $testDir 'wakeupcat.jpg'; $outputPath = Join-Path $testDir 'deployed-version-results.html'; curl.exe --silent --show-error --max-time 90 --form "pic=@$imagePath;type=image/jpeg" "$baseUrl/analyze" --output $outputPath --write-out 'HTTP %{http_code}\n'; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; $html = Get-Content -LiteralPath $outputPath -Raw; if ($html -match 'Google Cloud Vision Results' -and $html -match '\d+\.\d% confidence') { [regex]::Matches($html,'<strong>([^<]+)</strong>\s*[^\d<]*([\d.]+)% confidence') | ForEach-Object { '{0}: {1}%' -f $_.Groups[1].Value,$_.Groups[2].Value } } else { Write-Output $html; exit 1 }
```

### Invocation 22

```powershell
gcloud app services set-traffic default --splits=vision-20261112-01=1 --project=g21-express-20261022-vk --quiet
```

### Invocation 23

```powershell
$baseUrl = 'https://g21-express-20261022-vk.uc.r.appspot.com'; $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 60; [pscustomobject]@{URL=$baseUrl;StatusCode=$response.StatusCode;UploadForm=($response.Content -match 'enctype="multipart/form-data"')} | ConvertTo-Json; $testDir = Join-Path $env:TEMP 'saas-google-vision-verification'; $imagePath = Join-Path $testDir 'wakeupcat.jpg'; $outputPath = Join-Path $testDir 'public-results.html'; curl.exe --silent --show-error --max-time 90 --form "pic=@$imagePath;type=image/jpeg" "$baseUrl/analyze" --output $outputPath --write-out 'HTTP %{http_code}\n'; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; $html = Get-Content -LiteralPath $outputPath -Raw; if ($html -match 'Google Cloud Vision Results' -and $html -match '\d+\.\d% confidence') { [regex]::Matches($html,'<strong>([^<]+)</strong>\s*[^\d<]*([\d.]+)% confidence') | ForEach-Object { '{0}: {1}%' -f $_.Groups[1].Value,$_.Groups[2].Value } } else { Write-Output $html; exit 1 }
```

### Invocation 24

```powershell
gcloud app services describe default --project=g21-express-20261022-vk --format='json(id,split)'; gcloud app versions describe vision-20261112-01 --service=default --project=g21-express-20261022-vk --format='json(id,runtime,env,servingStatus,serviceAccount,automaticScaling,versionUrl)'; gcloud services list --enabled --project=g21-express-20261022-vk --filter='config.name:(vision.googleapis.com appengine.googleapis.com cloudbuild.googleapis.com)' --format='value(config.name)'; git status --short; git diff --stat
```

### Invocation 25

```powershell
git status --short; git diff --exit-code -- server.js public/index.html package.json package-lock.json app.yaml .gitignore .gcloudignore; Get-Item -LiteralPath DEPLOYMENT-REPORT.md | Select-Object Name,Length
```
