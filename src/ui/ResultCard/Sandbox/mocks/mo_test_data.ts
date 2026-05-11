import type { SandboxBody as SandboxData } from 'components/models/base/result_body';

export const sandbox_data: SandboxData = {
  signatures: [
    {
      name: 'queries_computer_name',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [],
      actors: [],
      malware_families: [],
      data: [],
      score: 10,
      pid: [4600, 7704],
      description: 'Queries computer hostname'
    },
    {
      name: 'dead_connect',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [],
      actors: [],
      malware_families: [],
      data: [
        {
          IP: '13.107.246.35:443 (unknown)'
        },
        {
          IP: '13.107.213.35:443 (unknown)'
        }
      ],
      score: 10,
      pid: [7704],
      description: 'Attempts to connect to a dead IP:Port (2 unique times)'
    },
    {
      name: 'queries_keyboard_layout',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [],
      actors: [],
      malware_families: [],
      data: [],
      score: 10,
      pid: [4600, 7704],
      description: 'Queries the keyboard layout'
    },
    {
      name: 'language_check_registry',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [],
      actors: [],
      malware_families: [],
      data: [
        {
          regkey: 'HKEY_LOCAL_MACHINE\\SYSTEM\\ControlSet001\\Control\\Nls\\CustomLocale\\en-US'
        },
        {
          regkey: 'HKEY_LOCAL_MACHINE\\SYSTEM\\ControlSet001\\Control\\Nls\\ExtendedLocale\\en-US'
        }
      ],
      score: 10,
      description: 'Checks system language via registry key (possible geofencing)'
    },
    {
      name: 'resumethread_remote_process',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [
        {
          attack_id: 'T1055',
          pattern: 'Process Injection',
          categories: ['defense-evasion', 'privilege-escalation']
        }
      ],
      actors: [],
      malware_families: [],
      data: [
        {
          thread_resumed:
            'Process rundll32.exe with process ID 4600 resumed a thread in another process with the process ID 7704'
        },
        {
          thread_resumed:
            'Process services.exe with process ID 620 resumed a thread in another process with the process ID 7248'
        }
      ],
      score: 30,
      pid: [4600, 620],
      description: 'Resumed a thread in another process'
    },
    {
      name: 'injection_write_process',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [],
      actors: [],
      malware_families: [],
      data: [
        {
          write_memory: 'Process rundll32.exe with process ID 4600 wrote to the memory of process handle 0x00000338'
        }
      ],
      score: 30,
      pid: [4600],
      description: 'Writes to the memory another process'
    },
    {
      name: 'createtoolhelp32snapshot_module_enumeration',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [],
      actors: [],
      malware_families: [],
      data: [
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 8036 module ntdll.dll'
        },
        {
          module: 'pid 8036 module KERNEL32.DLL'
        },
        {
          module: 'pid 8036 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 8036 module ntdll.dll'
        },
        {
          module: 'pid 8036 module KERNEL32.DLL'
        },
        {
          module: 'pid 8036 module KERNELBASE.dll'
        },
        {
          module: 'pid 8036 module msvcrt.dll'
        },
        {
          module: 'pid 8036 module advapi32.dll'
        },
        {
          module: 'pid 8036 module sechost.dll'
        },
        {
          module: 'pid 8036 module RPCRT4.dll'
        },
        {
          module: 'pid 8036 module auditpolcore.dll'
        },
        {
          module: 'pid 8036 module ntmarta.dll'
        },
        {
          module: 'pid 8036 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 7704 module ondemandconnroutehelper.dll'
        },
        {
          module: 'pid 7704 module winhttp.dll'
        },
        {
          module: 'pid 7704 module mswsock.dll'
        },
        {
          module: 'pid 7704 module IPHLPAPI.DLL'
        },
        {
          module: 'pid 7704 module WINNSI.DLL'
        },
        {
          module: 'pid 7704 module NSI.dll'
        },
        {
          module: 'pid 7704 module MSCTF.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 7704 module ondemandconnroutehelper.dll'
        },
        {
          module: 'pid 7704 module winhttp.dll'
        },
        {
          module: 'pid 7704 module mswsock.dll'
        },
        {
          module: 'pid 7704 module IPHLPAPI.DLL'
        },
        {
          module: 'pid 7704 module WINNSI.DLL'
        },
        {
          module: 'pid 7704 module NSI.dll'
        },
        {
          module: 'pid 7704 module MSCTF.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 7704 module ondemandconnroutehelper.dll'
        },
        {
          module: 'pid 7704 module winhttp.dll'
        },
        {
          module: 'pid 7704 module mswsock.dll'
        },
        {
          module: 'pid 7704 module IPHLPAPI.DLL'
        },
        {
          module: 'pid 7704 module WINNSI.DLL'
        },
        {
          module: 'pid 7704 module NSI.dll'
        },
        {
          module: 'pid 7704 module MSCTF.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 7704 module ondemandconnroutehelper.dll'
        },
        {
          module: 'pid 7704 module winhttp.dll'
        },
        {
          module: 'pid 7704 module mswsock.dll'
        },
        {
          module: 'pid 7704 module IPHLPAPI.DLL'
        },
        {
          module: 'pid 7704 module WINNSI.DLL'
        },
        {
          module: 'pid 7704 module NSI.dll'
        },
        {
          module: 'pid 7704 module MSCTF.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 7704 module ondemandconnroutehelper.dll'
        },
        {
          module: 'pid 7704 module winhttp.dll'
        },
        {
          module: 'pid 7704 module mswsock.dll'
        },
        {
          module: 'pid 7704 module IPHLPAPI.DLL'
        },
        {
          module: 'pid 7704 module WINNSI.DLL'
        },
        {
          module: 'pid 7704 module NSI.dll'
        },
        {
          module: 'pid 7704 module MSCTF.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 7704 module ondemandconnroutehelper.dll'
        },
        {
          module: 'pid 7704 module winhttp.dll'
        },
        {
          module: 'pid 7704 module mswsock.dll'
        },
        {
          module: 'pid 7704 module IPHLPAPI.DLL'
        },
        {
          module: 'pid 7704 module WINNSI.DLL'
        },
        {
          module: 'pid 7704 module NSI.dll'
        },
        {
          module: 'pid 7704 module MSCTF.dll'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module NSI.dll'
        },
        {
          module: 'pid 7704 module MSCTF.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 7704 module ondemandconnroutehelper.dll'
        },
        {
          module: 'pid 7704 module winhttp.dll'
        },
        {
          module: 'pid 7704 module mswsock.dll'
        },
        {
          module: 'pid 7704 module IPHLPAPI.DLL'
        },
        {
          module: 'pid 7704 module WINNSI.DLL'
        },
        {
          module: 'pid 7704 module NSI.dll'
        },
        {
          module: 'pid 7704 module MSCTF.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 7704 module ondemandconnroutehelper.dll'
        },
        {
          module: 'pid 7704 module winhttp.dll'
        },
        {
          module: 'pid 7704 module mswsock.dll'
        },
        {
          module: 'pid 7704 module IPHLPAPI.DLL'
        },
        {
          module: 'pid 7704 module WINNSI.DLL'
        },
        {
          module: 'pid 7704 module NSI.dll'
        },
        {
          module: 'pid 7704 module MSCTF.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 7704 module ondemandconnroutehelper.dll'
        },
        {
          module: 'pid 7704 module winhttp.dll'
        },
        {
          module: 'pid 7704 module mswsock.dll'
        },
        {
          module: 'pid 7704 module IPHLPAPI.DLL'
        },
        {
          module: 'pid 7704 module WINNSI.DLL'
        },
        {
          module: 'pid 7704 module NSI.dll'
        },
        {
          module: 'pid 7704 module MSCTF.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 7704 module ondemandconnroutehelper.dll'
        },
        {
          module: 'pid 7704 module winhttp.dll'
        },
        {
          module: 'pid 7704 module mswsock.dll'
        },
        {
          module: 'pid 7704 module IPHLPAPI.DLL'
        },
        {
          module: 'pid 7704 module WINNSI.DLL'
        },
        {
          module: 'pid 7704 module NSI.dll'
        },
        {
          module: 'pid 7704 module MSCTF.dll'
        },
        {
          module: 'pid 7704 module DNSAPI.dll'
        },
        {
          module: 'pid 7704 module fwpuclnt.dll'
        },
        {
          module: 'pid 7704 module rasadhlp.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 7704 module ondemandconnroutehelper.dll'
        },
        {
          module: 'pid 7704 module winhttp.dll'
        },
        {
          module: 'pid 7704 module mswsock.dll'
        },
        {
          module: 'pid 7704 module IPHLPAPI.DLL'
        },
        {
          module: 'pid 7704 module WINNSI.DLL'
        },
        {
          module: 'pid 7704 module NSI.dll'
        },
        {
          module: 'pid 7704 module MSCTF.dll'
        },
        {
          module: 'pid 7704 module DNSAPI.dll'
        },
        {
          module: 'pid 7704 module fwpuclnt.dll'
        },
        {
          module: 'pid 7704 module rasadhlp.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        },
        {
          module: 'pid 7704 module wtsapi32.dll'
        },
        {
          module: 'pid 7704 module windows.storage.dll'
        },
        {
          module: 'pid 7704 module Wldp.dll'
        },
        {
          module: 'pid 7704 module profapi.dll'
        },
        {
          module: 'pid 7704 module WINSTA.dll'
        },
        {
          module: 'pid 7704 module SAMLIB.dll'
        },
        {
          module: 'pid 7704 module wininet.dll'
        },
        {
          module: 'pid 7704 module urlmon.dll'
        },
        {
          module: 'pid 7704 module iertutil.dll'
        },
        {
          module: 'pid 7704 module kernel.appcore.dll'
        },
        {
          module: 'pid 7704 module uxtheme.dll'
        },
        {
          module: 'pid 7704 module ondemandconnroutehelper.dll'
        },
        {
          module: 'pid 7704 module winhttp.dll'
        },
        {
          module: 'pid 7704 module mswsock.dll'
        },
        {
          module: 'pid 7704 module IPHLPAPI.DLL'
        },
        {
          module: 'pid 7704 module WINNSI.DLL'
        },
        {
          module: 'pid 7704 module NSI.dll'
        },
        {
          module: 'pid 7704 module MSCTF.dll'
        },
        {
          module: 'pid 7704 module DNSAPI.dll'
        },
        {
          module: 'pid 7704 module fwpuclnt.dll'
        },
        {
          module: 'pid 7704 module rasadhlp.dll'
        },
        {
          module: 'pid 1504 module ntdll.dll'
        },
        {
          module: 'pid 1504 module KERNEL32.DLL'
        },
        {
          module: 'pid 1504 module KERNELBASE.dll'
        },
        {
          module: 'pid 1504 module msvcrt.dll'
        },
        {
          module: 'pid 1504 module combase.dll'
        },
        {
          module: 'pid 1504 module ucrtbase.dll'
        },
        {
          module: 'pid 1504 module RPCRT4.dll'
        },
        {
          module: 'pid 1504 module sechost.dll'
        },
        {
          module: 'pid 1504 module apphelp.dll'
        },
        {
          module: 'pid 7704 module ntdll.dll'
        },
        {
          module: 'pid 7704 module KERNEL32.DLL'
        },
        {
          module: 'pid 7704 module KERNELBASE.dll'
        },
        {
          module: 'pid 7704 module CRYPT32.dll'
        },
        {
          module: 'pid 7704 module ucrtbase.dll'
        },
        {
          module: 'pid 7704 module WS2_32.dll'
        },
        {
          module: 'pid 7704 module RPCRT4.dll'
        },
        {
          module: 'pid 7704 module USER32.dll'
        },
        {
          module: 'pid 7704 module win32u.dll'
        },
        {
          module: 'pid 7704 module GDI32.dll'
        },
        {
          module: 'pid 7704 module gdi32full.dll'
        },
        {
          module: 'pid 7704 module msvcp_win.dll'
        },
        {
          module: 'pid 7704 module ADVAPI32.dll'
        },
        {
          module: 'pid 7704 module msvcrt.dll'
        },
        {
          module: 'pid 7704 module sechost.dll'
        },
        {
          module: 'pid 7704 module ole32.dll'
        },
        {
          module: 'pid 7704 module combase.dll'
        },
        {
          module: 'pid 7704 module OLEAUT32.dll'
        },
        {
          module: 'pid 7704 module SHLWAPI.dll'
        },
        {
          module: 'pid 7704 module bcrypt.dll'
        },
        {
          module: 'pid 7704 module shcore.dll'
        },
        {
          module: 'pid 7704 module ntmarta.dll'
        },
        {
          module: 'pid 7704 module wer.dll'
        },
        {
          module: 'pid 7704 module IMM32.DLL'
        },
        {
          module: 'pid 7704 module CRYPTBASE.DLL'
        },
        {
          module: 'pid 7704 module SspiCli.dll'
        },
        {
          module: 'pid 7704 module SHELL32.dll'
        },
        {
          module: 'pid 7704 module netapi32.dll'
        },
        {
          module: 'pid 7704 module SRVCLI.dll'
        },
        {
          module: 'pid 7704 module SAMCLI.dll'
        },
        {
          module: 'pid 7704 module NETUTILS.dll'
        },
        {
          module: 'pid 7704 module LOGONCLI.dll'
        },
        {
          module: 'pid 7704 module WKSCLI.dll'
        },
        {
          module: 'pid 7704 module userenv.dll'
        }
      ],
      score: 30,
      pid: [7704],
      description: 'Enumerates the modules from a process (may be used to locate base addresses in process injection)'
    },
    {
      name: 'enumerates_running_processes',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [],
      actors: [],
      malware_families: [],
      data: [
        {
          process: 'System with pid 4'
        },
        {
          process: 'Registry with pid 92'
        },
        {
          process: 'smss.exe with pid 336'
        },
        {
          process: 'csrss.exe with pid 436'
        },
        {
          process: 'wininit.exe with pid 528'
        },
        {
          process: 'csrss.exe with pid 536'
        },
        {
          process: 'services.exe with pid 620'
        },
        {
          process: 'winlogon.exe with pid 628'
        },
        {
          process: 'lsass.exe with pid 640'
        },
        {
          process: 'fontdrvhost.exe with pid 752'
        },
        {
          process: 'fontdrvhost.exe with pid 760'
        },
        {
          process: 'svchost.exe with pid 776'
        },
        {
          process: 'svchost.exe with pid 856'
        },
        {
          process: 'svchost.exe with pid 904'
        },
        {
          process: 'svchost.exe with pid 956'
        },
        {
          process: 'dwm.exe with pid 352'
        },
        {
          process: 'svchost.exe with pid 484'
        },
        {
          process: 'svchost.exe with pid 1028'
        },
        {
          process: 'svchost.exe with pid 1036'
        },
        {
          process: 'svchost.exe with pid 1072'
        },
        {
          process: 'svchost.exe with pid 1084'
        },
        {
          process: 'svchost.exe with pid 1236'
        },
        {
          process: 'svchost.exe with pid 1280'
        },
        {
          process: 'svchost.exe with pid 1292'
        },
        {
          process: 'svchost.exe with pid 1452'
        },
        {
          process: 'svchost.exe with pid 1472'
        },
        {
          process: 'svchost.exe with pid 1576'
        },
        {
          process: 'svchost.exe with pid 1596'
        },
        {
          process: 'svchost.exe with pid 1620'
        },
        {
          process: 'svchost.exe with pid 1656'
        },
        {
          process: 'svchost.exe with pid 1664'
        },
        {
          process: 'svchost.exe with pid 1684'
        },
        {
          process: 'svchost.exe with pid 1780'
        },
        {
          process: 'Memory Compression with pid 1876'
        },
        {
          process: 'svchost.exe with pid 1892'
        },
        {
          process: 'svchost.exe with pid 1904'
        },
        {
          process: 'svchost.exe with pid 1960'
        },
        {
          process: 'svchost.exe with pid 2024'
        },
        {
          process: 'svchost.exe with pid 1124'
        },
        {
          process: 'svchost.exe with pid 404'
        },
        {
          process: 'svchost.exe with pid 2128'
        },
        {
          process: 'svchost.exe with pid 2196'
        },
        {
          process: 'svchost.exe with pid 2308'
        },
        {
          process: 'svchost.exe with pid 2316'
        },
        {
          process: 'svchost.exe with pid 2328'
        },
        {
          process: 'svchost.exe with pid 2340'
        },
        {
          process: 'svchost.exe with pid 2356'
        },
        {
          process: 'svchost.exe with pid 2476'
        },
        {
          process: 'spoolsv.exe with pid 2584'
        },
        {
          process: 'svchost.exe with pid 2628'
        },
        {
          process: 'svchost.exe with pid 2696'
        },
        {
          process: 'svchost.exe with pid 2764'
        },
        {
          process: 'svchost.exe with pid 2860'
        },
        {
          process: 'svchost.exe with pid 2868'
        },
        {
          process: 'svchost.exe with pid 2880'
        },
        {
          process: 'svchost.exe with pid 2892'
        },
        {
          process: 'svchost.exe with pid 2904'
        },
        {
          process: 'svchost.exe with pid 3028'
        },
        {
          process: 'svchost.exe with pid 3040'
        },
        {
          process: 'mqsvc.exe with pid 3052'
        },
        {
          process: 'svchost.exe with pid 3068'
        },
        {
          process: 'SMSvcHost.exe with pid 2292'
        },
        {
          process: 'svchost.exe with pid 2740'
        },
        {
          process: 'svchost.exe with pid 2752'
        },
        {
          process: 'svchost.exe with pid 3120'
        },
        {
          process: 'svchost.exe with pid 3156'
        },
        {
          process: 'svchost.exe with pid 3436'
        },
        {
          process: 'svchost.exe with pid 3568'
        },
        {
          process: 'SMSvcHost.exe with pid 3876'
        },
        {
          process: 'svchost.exe with pid 4476'
        },
        {
          process: 'svchost.exe with pid 4588'
        },
        {
          process: 'svchost.exe with pid 4832'
        },
        {
          process: 'sihost.exe with pid 3448'
        },
        {
          process: 'svchost.exe with pid 4188'
        },
        {
          process: 'svchost.exe with pid 2220'
        },
        {
          process: 'svchost.exe with pid 3372'
        },
        {
          process: 'taskhostw.exe with pid 2452'
        },
        {
          process: 'svchost.exe with pid 5232'
        },
        {
          process: 'ctfmon.exe with pid 5260'
        },
        {
          process: 'svchost.exe with pid 5348'
        },
        {
          process: 'explorer.exe with pid 5484'
        },
        {
          process: 'svchost.exe with pid 5588'
        },
        {
          process: 'StartMenuExperienceHost.exe with pid 5972'
        },
        {
          process: 'RuntimeBroker.exe with pid 6044'
        },
        {
          process: 'SearchApp.exe with pid 372'
        },
        {
          process: 'RuntimeBroker.exe with pid 5168'
        },
        {
          process: 'SearchIndexer.exe with pid 5496'
        },
        {
          process: 'RuntimeBroker.exe with pid 6192'
        },
        {
          process: 'PhoneExperienceHost.exe with pid 6432'
        },
        {
          process: 'RuntimeBroker.exe with pid 6588'
        },
        {
          process: 'SystemSettings.exe with pid 6240'
        },
        {
          process: 'ApplicationFrameHost.exe with pid 6228'
        },
        {
          process: 'svchost.exe with pid 7008'
        },
        {
          process: 'SgrmBroker.exe with pid 736'
        },
        {
          process: 'svchost.exe with pid 6296'
        },
        {
          process: 'svchost.exe with pid 7064'
        },
        {
          process: 'svchost.exe with pid 6692'
        },
        {
          process: 'svchost.exe with pid 2368'
        },
        {
          process: 'svchost.exe with pid 1104'
        },
        {
          process: 'taskhostw.exe with pid 2968'
        },
        {
          process: 'svchost.exe with pid 7080'
        },
        {
          process: 'svchost.exe with pid 1212'
        },
        {
          process: 'svchost.exe with pid 6760'
        },
        {
          process: 'svchost.exe with pid 5132'
        },
        {
          process: 'svchost.exe with pid 832'
        },
        {
          process: 'upfc.exe with pid 1980'
        },
        {
          process: 'taskhostw.exe with pid 2980'
        },
        {
          process: 'culauncher.exe with pid 2680'
        },
        {
          process: 'MusNotification.exe with pid 7164'
        },
        {
          process: 'svchost.exe with pid 3132'
        },
        {
          process: 'TrustedInstaller.exe with pid 1992'
        },
        {
          process: 'TiWorker.exe with pid 5988'
        },
        {
          process: 'MoUsoCoreWorker.exe with pid 1636'
        },
        {
          process: 'sppsvc.exe with pid 3260'
        },
        {
          process: 'SppExtComObj.Exe with pid 1948'
        },
        {
          process: 'slui.exe with pid 5472'
        },
        {
          process: 'SearchProtocolHost.exe with pid 300'
        },
        {
          process: 'svchost.exe with pid 2912'
        },
        {
          process: 'ngentask.exe with pid 3224'
        },
        {
          process: 'conhost.exe with pid 2396'
        },
        {
          process: 'svchost.exe with pid 4536'
        },
        {
          process: 'cmd.exe with pid 1504'
        },
        {
          process: 'conhost.exe with pid 6728'
        },
        {
          process: 'hh_etw.exe with pid 1320'
        },
        {
          process: 'SMaster64.exe with pid 664'
        },
        {
          process: 'unsecapp.exe with pid 6864'
        },
        {
          process: 'SearchFilterHost.exe with pid 7032'
        },
        {
          process: 'svchost.exe with pid 5460'
        },
        {
          process: 'rundll32.exe with pid 4600'
        },
        {
          process: 'auditpol.exe with pid 7516'
        },
        {
          process: 'ngen.exe with pid 7548'
        },
        {
          process: 'conhost.exe with pid 7508'
        },
        {
          process: 'wermgr.exe with pid 7704'
        },
        {
          process: 'auditpol.exe with pid 8036'
        },
        {
          process: 'conhost.exe with pid 7176'
        }
      ],
      score: 30,
      pid: [4600, 7704],
      description: 'Enumerates running processes'
    },
    {
      name: 'process_interest',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [],
      actors: [],
      malware_families: [],
      data: [
        {
          process: 'svchost.exe'
        }
      ],
      score: 30,
      pid: [4600, 7704],
      description: 'Expresses interest in specific running processes'
    },
    {
      name: 'process_needed',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [],
      actors: [],
      malware_families: [],
      data: [],
      score: 30,
      pid: [4600, 7704, 7248],
      description: 'Repeatedly searches for a not-found process, may want to run with startbrowser=1 option'
    },
    {
      name: 'packer_unknown_pe_section_name',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [
        {
          attack_id: 'T1027.002',
          pattern: 'Software Packing',
          categories: ['defense-evasion']
        }
      ],
      actors: [],
      malware_families: [],
      data: [
        {
          'unknown section': {
            name: '.gfids',
            raw_address: '0x00099a00',
            virtual_address: '0x0009d000',
            virtual_size: '0x000000a8',
            size_of_data: '0x00000200',
            characteristics: 'IMAGE_SCN_CNT_INITIALIZED_DATA|IMAGE_SCN_MEM_READ',
            characteristics_raw: '0x40000040',
            entropy: '1.59'
          }
        }
      ],
      score: 30,
      description: 'The binary contains an unknown PE section name indicative of packing'
    },
    {
      name: 'injection_rwx',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [
        {
          attack_id: 'T1055',
          pattern: 'Process Injection',
          categories: ['defense-evasion', 'privilege-escalation']
        }
      ],
      actors: [],
      malware_families: [],
      data: [],
      score: 30,
      pid: [4600],
      description: 'Creates RWX memory'
    },
    {
      name: 'mimics_agent',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [
        {
          attack_id: 'T1036',
          pattern: 'Masquerading',
          categories: ['defense-evasion']
        },
        {
          attack_id: 'T1564.001',
          pattern: 'Hidden Files and Directories',
          categories: ['defense-evasion']
        },
        {
          attack_id: 'T1070',
          pattern: 'Indicator Removal',
          categories: ['defense-evasion']
        }
      ],
      actors: [],
      malware_families: [],
      data: [],
      score: 30,
      pid: [7704],
      description: "Mimics the system's user agent string for its own requests"
    },
    {
      name: 'infostealer_cookies',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [
        {
          attack_id: 'T1003',
          pattern: 'OS Credential Dumping',
          categories: ['credential-access']
        },
        {
          attack_id: 'T1005',
          pattern: 'Data from Local System',
          categories: ['collection']
        }
      ],
      actors: [],
      malware_families: [],
      data: [],
      score: 50,
      description: 'Touches a file containing cookies, possibly for information gathering'
    },
    {
      name: 'procmem_yara',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [],
      actors: [],
      malware_families: [],
      data: [
        {
          Hit: "PID 4600 triggered the Yara rule 'QakBot4' with data '['{ 33 C0 C7 01 01 23 45 67 89 41 14 89 41 18 89 41 5C C7 41 04 89 AB CD EF C7 41 08 FE DC BA 98 C7 41 0C 76 54 32 10 C7 41 10 F0 E1 D2 C3 89 41 60 89 41 64 C3 }']'"
        },
        {
          Hit: "PID 4600 triggered the Yara rule 'QakBot4' with data '['{ 33 C0 C7 01 01 23 45 67 89 41 14 89 41 18 89 41 5C C7 41 04 89 AB CD EF C7 41 08 FE DC BA 98 C7 41 0C 76 54 32 10 C7 41 10 F0 E1 D2 C3 89 41 60 89 41 64 C3 }']'"
        },
        {
          Hit: "PID 7704 triggered the Yara rule 'QakBot4' with data '['{ 33 C0 C7 01 01 23 45 67 89 41 14 89 41 18 89 41 5C C7 41 04 89 AB CD EF C7 41 08 FE DC BA 98 C7 41 0C 76 54 32 10 C7 41 10 F0 E1 D2 C3 89 41 60 89 41 64 C3 }']'"
        },
        {
          Hit: "PID 4600 triggered the Yara rule 'QakBot4' with data '['{ 33 C0 C7 01 01 23 45 67 89 41 14 89 41 18 89 41 5C C7 41 04 89 AB CD EF C7 41 08 FE DC BA 98 C7 41 0C 76 54 32 10 C7 41 10 F0 E1 D2 C3 89 41 60 89 41 64 C3 }']'"
        }
      ],
      score: 50,
      description: 'Yara detections observed in process dumps, payloads or dropped files'
    },
    {
      name: 'suspicious_command_tools',
      type: 'CUCKOO',
      classification: 'TLP:C',
      attacks: [
        {
          attack_id: 'T1059',
          pattern: 'Command and Scripting Interpreter',
          categories: ['execution']
        }
      ],
      actors: [],
      malware_families: [],
      data: [
        {
          command: 'C:\\WINDOWS\\system32\\svchost.exe -k appmodel -p -s camsvc'
        }
      ],
      score: 50,
      description: 'Uses suspicious command line tools or Windows utilities'
    }
  ],
  network_connections: [
    {
      destination_ip: '169.254.128.1',
      destination_port: 53,
      transport_layer_protocol: 'udp',
      direction: 'outbound',
      process: null,
      source_ip: null,
      source_port: null,
      http_details: null,
      dns_details: {
        domain: '1.128.254.169.in-addr.arpa',
        resolved_ips: null,
        resolved_domains: ['cape-u-10.local'],
        lookup_type: 'PTR'
      },
      connection_type: 'dns'
    },
    {
      destination_ip: '169.254.128.1',
      destination_port: 53,
      transport_layer_protocol: 'udp',
      direction: 'outbound',
      process: null,
      source_ip: null,
      source_port: null,
      http_details: null,
      dns_details: {
        domain: 'microsoft.com',
        resolved_ips: ['13.107.213.35', '13.107.246.35'],
        resolved_domains: null,
        lookup_type: 'A'
      },
      connection_type: 'dns'
    }
  ],
  processes: [
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:20:32.764',
      ppid: 4580,
      pid: 408,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\svchost.exe',
      start_time: '2025-10-17 16:20:26.577',
      ppid: 620,
      pid: 456,
      command_line: 'C:\\WINDOWS\\system32\\svchost.exe -k LocalService -p -s BthAvctpSvc',
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'system',
      image_hash: '643EC58E82E0272C97C2A59F6020970D881AF19C0AD5029DB9C958C13B6558C7',
      original_file_name: 'svchost.exe',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\svchost.exe',
      start_time: '2025-10-17 16:19:24.160',
      ppid: 620,
      pid: 7392,
      command_line: 'C:\\WINDOWS\\system32\\svchost.exe -k LocalService -p -s BthAvctpSvc',
      end_time: '2025-10-17 16:20:26.464',
      integrity_level: 'system',
      image_hash: '643EC58E82E0272C97C2A59F6020970D881AF19C0AD5029DB9C958C13B6558C7',
      original_file_name: 'svchost.exe',
      safelisted: false,
      file_count: 6,
      registry_count: 252
    },
    {
      image: 'C:\\Windows\\System32\\svchost.exe',
      start_time: '2025-10-17 16:19:24.117',
      ppid: 620,
      pid: 7248,
      command_line: 'C:\\WINDOWS\\system32\\svchost.exe -k appmodel -p -s camsvc',
      end_time: '2025-10-17 16:20:14.324',
      integrity_level: 'system',
      image_hash: '643EC58E82E0272C97C2A59F6020970D881AF19C0AD5029DB9C958C13B6558C7',
      original_file_name: 'svchost.exe',
      safelisted: false,
      file_count: 5,
      registry_count: 554
    },
    {
      image: 'C:\\Windows\\System32\\slui.exe',
      start_time: '2025-10-17 16:20:03.228',
      ppid: 856,
      pid: 7236,
      command_line: 'C:\\WINDOWS\\System32\\slui.exe -Embedding',
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '25E7624D469A592934AB8C509D12C153C2799E604C2A4B8A83650A7268577DFF',
      original_file_name: 'slui.exe',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:45.628',
      ppid: 6224,
      pid: 2720,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:44.393',
      ppid: 1484,
      pid: 7152,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:43.236',
      ppid: 228,
      pid: 7404,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:41.989',
      ppid: 7660,
      pid: 6256,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:40.713',
      ppid: 1068,
      pid: 5932,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:39.297',
      ppid: 7368,
      pid: 7896,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\SystemApps\\MicrosoftWindows.Client.CBS_cw5n1h2txyewy\\InputApp\\TextInputHost.exe',
      start_time: '2025-10-17 16:19:24.209',
      ppid: 856,
      pid: 7964,
      command_line:
        '"C:\\Windows\\SystemApps\\MicrosoftWindows.Client.CBS_cw5n1h2txyewy\\InputApp\\TextInputHost.exe" -ServerName:InputApp.AppX9jnwykgrccxc8by3hsrsh07r423xzvav.mca',
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'appcontainer',
      image_hash: 'C480752FBA0E9DAF476B548248A47A2C6BF14F3DE8045945FBEE9F9E92A7B41A',
      original_file_name: 'TextInputHost.exe',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:21.972',
      ppid: 7520,
      pid: 8028,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:20.862',
      ppid: 8176,
      pid: 7980,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:19.688',
      ppid: 6708,
      pid: 3576,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:18.520',
      ppid: 7924,
      pid: 8012,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\WaaSMedicAgent.exe',
      start_time: '2025-10-17 16:19:17.228',
      ppid: 3132,
      pid: 976,
      command_line:
        'C:\\WINDOWS\\System32\\WaaSMedicAgent.exe 50ffd7c56bc097977b9fa4a6a754abba U5ZP6d6NJ0ewpB4zAJnv6g.0.1.0.0.0',
      end_time: '2025-10-17 16:19:18.277',
      integrity_level: 'system',
      image_hash: '3783660B2D4A5F502D96140C62D2376DDB41F61F9A41844835256FE8358F5C75',
      original_file_name: 'WaasMedicAgent.exe',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:17.362',
      ppid: 5808,
      pid: 7264,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:17.247',
      ppid: 976,
      pid: 8156,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'system',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:16.230',
      ppid: 772,
      pid: 8052,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:14.988',
      ppid: 8104,
      pid: 8020,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:13.780',
      ppid: 7736,
      pid: 7816,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:12.321',
      ppid: 7876,
      pid: 4040,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:11.194',
      ppid: 7528,
      pid: 5836,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:10.427',
      ppid: 7292,
      pid: 7304,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\System32\\conhost.exe',
      start_time: '2025-10-17 16:19:10.195',
      ppid: 7188,
      pid: 7316,
      command_line: null,
      end_time: '9999-12-31 23:59:59.999999',
      integrity_level: 'high',
      image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
      original_file_name: 'CONHOST.EXE',
      safelisted: false
    },
    {
      image: 'C:\\Windows\\SysWOW64\\rundll32.exe',
      start_time: '2025-10-17 16:19:00.230',
      ppid: 276,
      pid: 4600,
      command_line:
        '"C:\\WINDOWS\\System32\\rundll32.exe" "C:\\Users\\buddy\\AppData\\Local\\Temp\\2cb8f04d41fe34706ff6.dll",DllRegisterServer',
      end_time: '-',
      integrity_level: null,
      image_hash: null,
      original_file_name: null,
      safelisted: false,
      file_count: 14,
      registry_count: 34
    },
    {
      image: 'C:\\Windows\\SysWOW64\\wermgr.exe',
      start_time: '2025-10-17 16:19:05.824',
      ppid: 4600,
      pid: 7704,
      command_line: 'C:\\WINDOWS\\SysWOW64\\wermgr.exe',
      end_time: '2025-10-17 16:20:07.292',
      integrity_level: null,
      image_hash: null,
      original_file_name: null,
      safelisted: false,
      file_count: 35,
      registry_count: 170
    },
    {
      image: 'C:\\Windows\\System32\\services.exe',
      start_time: '2025-10-17 16:19:09.667',
      ppid: 528,
      pid: 620,
      command_line: 'C:\\WINDOWS\\system32\\services.exe',
      end_time: '-',
      integrity_level: null,
      image_hash: null,
      original_file_name: null,
      safelisted: false,
      file_count: 2,
      registry_count: 0
    }
  ],
  analysis_information: {
    analysis_metadata: {
      start_time: '2025-10-17 16:18:41.000',
      task_id: 147856,
      end_time: '2025-10-17 16:20:44.000',
      routing: 'internet',
      machine_metadata: null
    },
    sandbox_name: 'CAPE',
    sandbox_version: '2.4-CAPE'
  }
};
