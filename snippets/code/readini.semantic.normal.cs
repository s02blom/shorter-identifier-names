// ReadIni: Parses the lines of an ini file
// lines: collection of lines containing one setting each, like key=value
// settings: settings
// rawLine: rawLine
// line: line
// setting: setting
// identifier: identifier
// property: property
 
public static Dictionary<string, string> ReadIni(IEnumerable<string> lines)
{
    var settings = new Dictionary<string, string>();
    foreach (string rawLine in lines)
    {
        string line = rawLine.Trim();
        string[] setting = line.Split('=');

        string identifier = setting[0];
        string property = setting[1];

        settings.Add(identifier, line);
    }
    return settings;
}
