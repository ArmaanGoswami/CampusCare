$ports = 5000, 5173, 5174

foreach ($port in $ports) {
  $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($conn in $connections) {
    try {
      Stop-Process -Id $conn.OwningProcess -Force -ErrorAction Stop
      Write-Host "Stopped process $($conn.OwningProcess) on port $port" -ForegroundColor Yellow
    } catch {
      Write-Host "Could not stop process $($conn.OwningProcess) on port $port" -ForegroundColor Red
    }
  }
}
