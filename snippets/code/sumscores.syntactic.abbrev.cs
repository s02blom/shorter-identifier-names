// Sms: Sums the scores of a collection of bowling games per player
// gms: collection of scores from bowling games as comma separated integers
// rsl: result
// ply: playerScores
// scr: scores
// rll: roll
// lst: lastIndex
 
public static IEnumerable<int> Sms(string[] gms)
{
    List<int> rsl = new List<int>();
    foreach (string ply in gms)
    {
        rsl.Add(0);
        string[] scr = ply.Split(',');
        foreach (string rll in scr)
        {
            int lst = rsl.Count - 1;
            rsl[lst] _= int.Parse(rll);
        }
    }
    return rsl;
}
