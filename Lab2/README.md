# Lab 2 - Microservices Edge Case Testing (Node/SQLite)

## Overview

This Lab 2 folder follows the same high-level layout style as the reference repository:

- services/
- tests/
- docs/

The implementation content is based on our Lab 1 microservices source.

## Members

Section: BSIT 3B

- Roma, Sean Justin
- Labrador, Mariene
- Garcia, Sophia Christi
- Bermejo, Kate Nicole
- Andura, Carla

## Services

- student-service (port 4001)
- course-service (port 4002)
- enrollment-service (port 4003)
- dashboard-service (port 4010)

## Setup

From this Lab2 folder:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab2
npm run install:all
```

## Run

Open separate terminals:

Terminal 1:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab2
npm run start:student
```

Terminal 2:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab2
npm run start:course
```

Terminal 3:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab2
npm run start:enrollment
```

Terminal 4 (optional dashboard):

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab2
npm run start:dashboard
```

## Testing

### curl Commands

All curl test commands are in [tests/curl-tests.md](tests/curl-tests.md).

Evidence output files are saved in [docs/evidence/](docs/evidence/).

#### Why `curl.exe` instead of `curl`?

We use **`curl.exe`** (the explicit executable) rather than just `curl` for several reasons:

1. **Windows Compatibility**: On Windows, `curl.exe` is the explicit path to the curl executable. Using just `curl` can cause issues if PowerShell aliases or shell builtins conflict with the actual executable.

2. **Avoid PowerShell Aliases**: PowerShell (especially older versions) may alias `curl` to `Invoke-WebRequest`. By using `curl.exe`, we force execution of the actual curl utility, bypassing any aliases.

3. **Explicit & Clear**: `curl.exe` makes it explicit that we're calling the Windows binary, improving code readability and reducing ambiguity across different terminal environments (cmd.exe, PowerShell, Git Bash).

4. **Cross-Platform Consistency**: While Linux/Mac users can use `curl`, Windows users benefit from the explicit `.exe` designation. This practice is a Windows best practice for avoiding path resolution issues.

5. **Portable Output**: All evidence files saved with `curl.exe` commands produce consistent, reproducible results across team members' machines.

## Deliverables

- Source code: services/
- Curl commands: tests/curl-tests.md
- Report: docs/report.md
- Evidence: docs/evidence/
