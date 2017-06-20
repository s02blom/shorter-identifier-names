// a: Returns the number of children within a list of people's ages
// b: ages, separated by spaces
// c: lower inclusive boundary of ages to count
// d: upper inclusive boundary of ages to count
// e: children
// f: numbers
// g: index
// h: personAge
// i: withinRange
 
public static int a(string b, int c, int d)
{
    int e = 0;
    string[] f = b.Split(' ');
    for (int g = 0; g < f.Length; g++)
    {
        int h = int.Parse(f[e]);
        bool i = (h >= c && h <= d);
        if (i)
        {
            e += 1;
        }
    }
    return e;
}
