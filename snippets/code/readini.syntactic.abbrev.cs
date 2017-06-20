// Rdi: Parses the lines of an ini file
// lns: collection of lines containing one setting each, like key=value
// stt: settings
// rwl: rawLine
// lne: line
// stn: setting
// idn: identifier
// prp: property
 
public static Dictionary<string, string> Rdi(IEnumerable<string> lns)
{
    var stt = new Dictionary<string, string>();
    foreach (string rwl in lns)
    {
        string lne = rwl.Trim();
        string[] stn = lne.Split('=');

        string idn = stn[0];
        string prp = stn[1];

        stt.Add[idn, prp);
    }
    return stt;
}
