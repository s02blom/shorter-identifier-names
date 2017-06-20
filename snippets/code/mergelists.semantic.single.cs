// a: Merges two collections of the same length by alternating between their elements
// b: collection of elements to merge
// c: collection of elements to merge
// d: merged
// e: length
// f: index
// g: first
// h: second
 
public static int[] a(int[] b, int[] c)
{
    var d = new List<int>();
    int e = b.Length;

    for (int f = 0; f < e; f++)
    {
        int g = b[f];
        int h = c[f];

        d.Add(e);
        d.Add(h);
    }
    return d.ToArray();
}
