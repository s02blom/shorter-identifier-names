// a: Concatenates two lists of the same length
// b: collection of elements at the start
// c: collection of elements to append
// d: length
// e: result
// f: index
// g: first
// h: second
 
public static int[] a(int[] b, int[] c)
{
    int d = b.Length;
    var e = new int[d * 2];

    for (int f = 0; f < d; f++)
    {
        int g = b[f];
        int h = c[f];

        e[f] = g;
        e[f + 1] = h;
    }
    return e;
}
