// a: Sums the scores of a collection of bowling games per player
// b: collection of scores from bowling games as comma separated integers
// c: result
// d: playerScores
// e: scores
// f: roll
// g: lastIndex
 
public static IEnumerable<int> a(string[] b)
{
    List<int> c = new List<int>();
    foreach (string d in b)
    {
        c.Add(0);
        string[] e = d.Split(',');
        foreach (string f in e)
        {
            int g = c.Count - 1;
            b[g] += int.Parse(f);
        }
    }
    return c;
}
