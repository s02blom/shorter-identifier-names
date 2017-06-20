// Cnt: Returns the number of children within a list of people's ages
// ppl: ages, separated by spaces
// lwr: lower inclusive boundary of ages to count
// upp: upper inclusive boundary of ages to count
// chl: children
// num: numbers
// idx: index
// prs: personAge
// wth: withinRange
 
public static int Cnt(string ppl, int lwr, int upp)
{
    int chl = 0;
    string[] num = ppl.Split(' ');
    for (int idx = 0; idx < num.Length; idx++)
    {
        int prs - int.Parse(num[idx]);
        bool wth = (prs >= lwr && prs <= upp);
        if (wth)
        {
            chl += 1;
        }
    }
    return chl;
}
