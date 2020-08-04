Describe 'Application Security System Setup 01' {
    $MyBasePath = "C:\PesterTest01"
    $MySearchString="Application,Security,System,Setup"

    .\Get-Log.ps1 -LogType "$MySearchString" -ZipDirectory "$MyBasePath" -Save

    It "Returns a zip" {
        $Actual = Test-Path "$MyBasePath\*.zip"-PathType Leaf
        $Actual | Should -Be $True -Because "We created the zip file"
    }

    It "Returns a folder with 4 files " {
        $MyFullPath= (Resolve-Path -Path "$MyBasePath\*T*\windows_events")
        $Actual = (Get-ChildItem -Recurse $MyFullPath | Measure-Object).Count
        $Expected = 4

        $Actual | Should -Be $Expected -Because "We parsed 4 EVTX Files"
    }

    It "Returns Only EVTX format not any other " {
        $Actual = Test-Path "$MyBasePath\*T*\windows_events\*" -Exclude *.evtx
        $Expected = $false

        $Actual | Should -Be $Expected -Because "We want only evtx Files"
    }

}

Describe "Search for other events besides the Big 4" {
    $MyBasePath = "C:\PesterTest02"
    $MySearchString='Microsoft-Windows-Application-Experience/Program-Telemetry'
    .\Get-Log.ps1 -LogType "$MySearchString" -ZipDirectory "$MyBasePath" -From 20200801 -Explained

    It "Returns a zip" {
        $Actual = Test-Path "$MyBasePath\*.zip"-PathType Leaf
        $Actual | Should -Be $True -Because "We created the zip file"
    }

    It "Shouldn't return a Folder"{

        $MyFullPath= (Resolve-Path -Path "$MyBasePath\*T*\windows_events" -ErrorAction SilentlyContinue)
        $Actual = (Get-ChildItem $MyFullPath -Directory)
        $Actual | Should -Be $null -Because "We DID NOT specify we wanted to save the file"
    }
}

Describe "Multiple log entries" {
    $MyBasePath = "C:\PesterTest03"
    $MySearchString='Application,Microsoft-Windows-Application-Experience/Program-Telemetry'
    .\Get-Log.ps1 -LogType "$MySearchString" -ZipDirectory "$MyBasePath" -From 20200801 -Explained

    It "Returns a zip" {
        $Actual = Test-Path "$MyBasePath\*.zip"-PathType Leaf
        $Actual | Should -Be $True -Because "We created the zip file"
    }
}

Describe "Saves the original folder along with its files" {
    $MyBasePath = "C:\PesterTest04"
    $MySearchString='Application,Microsoft-Windows-Application-Experience/Program-Telemetry'
    .\Get-Log.ps1 -LogType "$MySearchString" -ZipDirectory "$MyBasePath" -From 20200801 -Explained -Save

    It "Should Have A Folder with two files inside" {
        $MyFullPath= (Resolve-Path -Path "$MyBasePath\*T*\windows_events")
        $Actual = (Get-ChildItem -Recurse $MyFullPath | Measure-Object).Count
        $Expected = 2
        $Actual | Should -Be $Expected -Because "We parsed 4 EVTX Files"
    }

}

