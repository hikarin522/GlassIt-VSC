
using System;
using System.Runtime.InteropServices;
using System.Diagnostics;

public static class CS {
	private const int GWL_EXSTYLE = -20;
	private const int WS_EX_LAYERED = 0x80000;
	private const uint LWA_ALPHA = 0x2;

	private delegate bool EnumWindowsProc(int hWnd, int lParam);
	[DllImport("user32.dll")]
	private static extern bool EnumThreadWindows(uint dwThreadId, EnumWindowsProc lpEnumFunc, int lParam);
	[DllImport("user32.dll")]
	private static extern uint GetWindowThreadProcessId(int hWnd, out int lpdwProcessId);
	[DllImport("user32.dll")]
	private static extern bool IsWindowVisible(int hWnd);
	[DllImport("user32.dll")]
	private static extern int GetWindowLong(int hWnd, int nIndex);
	[DllImport("user32.dll")]
	private static extern int SetWindowLong(int hWnd, int nIndex, int dwNewLong);
	[DllImport("user32.dll")]
	private static extern bool SetLayeredWindowAttributes(int hWnd, uint crKey, byte bAlpha, uint dwFlags);

	public static bool SetTransparency(int pid, byte alpha) {
		Process mainproc = Process.GetProcessById(pid);
		foreach (Process proc in Process.GetProcessesByName(mainproc.ProcessName)) {
			if (proc.StartInfo.FileName == mainproc.StartInfo.FileName) {
				int hMainWnd = proc.MainWindowHandle.ToInt32();
				if (hMainWnd != 0) {
					uint tid = GetWindowThreadProcessId(hMainWnd, out pid);
					bool result = EnumThreadWindows(tid, delegate(int hWnd, int lParam) {
						if (IsWindowVisible(hWnd)) {
							int windowLong = GetWindowLong(hWnd, GWL_EXSTYLE);
							SetWindowLong(hWnd, GWL_EXSTYLE, windowLong | WS_EX_LAYERED);
							SetLayeredWindowAttributes(hWnd, 0, alpha, LWA_ALPHA);
						}
						return true;
					}, 0);
					if (!result) {
						return false;
					}
				}
			}
		}
		return true;
	}
}
