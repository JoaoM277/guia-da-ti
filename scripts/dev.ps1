$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent

$backend = Start-Job -Name 'guia-backend' -ArgumentList $repoRoot -ScriptBlock {
    param($root)
    Set-Location $root
    dotnet run --project web/backend/GuiaDaTi.Api
    if ($LASTEXITCODE -ne 0) { throw 'O backend encerrou com erro.' }
}

$frontend = Start-Job -Name 'guia-frontend' -ArgumentList $repoRoot -ScriptBlock {
    param($root)
    Set-Location $root
    npm --prefix web/frontend run dev
    if ($LASTEXITCODE -ne 0) { throw 'O frontend encerrou com erro.' }
}

Write-Host 'Backend:  http://localhost:5080'
Write-Host 'Frontend: http://localhost:5173'
Write-Host 'Pressione Ctrl+C para encerrar os dois.'

try {
    while ($backend.State -eq 'Running' -and $frontend.State -eq 'Running') {
        Receive-Job -Job $backend,$frontend -ErrorAction Continue
        Start-Sleep -Milliseconds 250
    }

    Receive-Job -Job $backend,$frontend -ErrorAction Continue
    if ($backend.State -ne 'Running' -or $frontend.State -ne 'Running') {
        throw 'Um dos serviços encerrou. Os dois foram parados.'
    }
}
finally {
    Stop-Job -Job $backend,$frontend -ErrorAction SilentlyContinue
    Remove-Job -Job $backend,$frontend -Force -ErrorAction SilentlyContinue
}
