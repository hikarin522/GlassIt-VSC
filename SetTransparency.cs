
using System;
using System.Runtime.InteropServices;
using System.Diagnostics;

using Windows;

namespace GlassIt
{
    public static class SetTransParency
    {
        public static bool SetTransparency(int pid, byte alpha)
        {
            Process mainproc = Process.GetProcessById(pid);
            foreach (Process proc in Process.GetProcessesByName(mainproc.ProcessName))
            {
                if (proc.StartInfo.FileName != mainproc.StartInfo.FileName)
                {
                    continue;
                }

                IntPtr hMainWnd = proc.MainWindowHandle;
                if (hMainWnd == IntPtr.Zero)
                {
                    continue;
                }

                uint tid = User32.GetWindowThreadProcessId(hMainWnd, out pid);
                bool result = User32.EnumThreadWindows(tid, delegate(IntPtr hWnd, IntPtr lParam) {
                    if (!User32.IsWindowVisible(hWnd))
                    {
                        return true;
                    }

                    WS windowLong = User32.GetWindowLong(hWnd, GWL.EXSTYLE);
                    User32.SetWindowLong(hWnd, GWL.EXSTYLE, windowLong | WS.EX_LAYERED);

                    if (!User32.SetLayeredWindowAttributes(hWnd, 0, alpha, LWA.ALPHA))
                    {
                        return false;
                    }

                    User32.EnableBlurBehindWindow(hWnd);
                    return true;
                }, IntPtr.Zero);

                if (!result)
                {
                    return false;
                }
            }

            return true;
        }
    }
}

namespace Windows
{
    internal static class User32
    {
        public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

        [DllImport("user32.dll")]
        public static extern bool EnumThreadWindows(uint dwThreadId, EnumWindowsProc lpEnumFunc, IntPtr lParam);

        [DllImport("user32.dll")]
        public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out int lpdwProcessId);

        [DllImport("user32.dll")]
        public static extern bool IsWindowVisible(IntPtr hWnd);

        [DllImport("user32.dll")]
        public static extern WS GetWindowLong(IntPtr hWnd, GWL nIndex);

        [DllImport("user32.dll")]
        public static extern int SetWindowLong(IntPtr hWnd, GWL nIndex, WS dwNewLong);

        [DllImport("user32.dll")]
        public static extern bool SetLayeredWindowAttributes(IntPtr hWnd, uint crKey, byte bAlpha, LWA dwFlags);

        [DllImport("user32.dll")]
        public static extern int SetWindowCompositionAttribute(IntPtr hWnd, ref WindowCompositionAttribData data);

        public static void EnableBlurBehindWindow(IntPtr hWnd)
        {
            var accent = new AccentPolicy
            {
                AccentState = AccentState.ACCENT_ENABLE_BLURBEHIND,
                AccentFlags = 0x20,
                GradientColor = 0x00000000,
                AnimationId = 0
            };

            var data = new WindowCompositionAttribData
            {
                Attribute = WindowCompositionAttribute.WCA_ACCENT_POLICY,
                SizeOfData = Marshal.SizeOf(accent),
                Data = Marshal.AllocHGlobal(Marshal.SizeOf(accent))
            };

            try
            {
                Marshal.StructureToPtr(accent, data.Data, false);
                SetWindowCompositionAttribute(hWnd, ref data);
            }
            finally
            {
                if (data.Data != IntPtr.Zero)
                {
                    Marshal.FreeHGlobal(data.Data);
                }
            }
        }
    }

    internal enum GWL: int
    {
        EXSTYLE = -20,
        HINSTANCE = -6,
        HWNDPARENT = -8,
        ID = -12,
        STYLE = -16,
        USERDATA = -21,
        WNDPROC = -4,
    }

    [Flags]
    internal enum WS: int
    {
        EX_LAYERED = 0x80000,
    }

    internal enum LWA: int
    {
        COLORKEY = 1,
        ALPHA = 2,
    }

    internal enum AccentState
    {
        ACCENT_DISABLED = 0,
        ACCENT_ENABLE_GRADIENT = 1,
        ACCENT_ENABLE_TRANSPARENTGRADIENT = 2,
        ACCENT_ENABLE_BLURBEHIND = 3,
        ACCENT_INVALID_STATE = 4
    }

    [StructLayout(LayoutKind.Sequential)]
    internal struct AccentPolicy
    {
        public AccentState AccentState;
        public int AccentFlags;
        public int GradientColor;
        public int AnimationId;
    }

    internal enum WindowCompositionAttribute
    {
        WCA_ACCENT_POLICY = 19
    }

    [StructLayout(LayoutKind.Sequential)]
    internal struct WindowCompositionAttribData
    {
        public WindowCompositionAttribute Attribute;
        public IntPtr Data;
        public int SizeOfData;
    }
}
