// a: Reverses the items of a collection
// b: collection of items to reverse
// c: result
// d: left
// e: right
// f: auxiliary
 
public static int[] a(int[] b)
{
    int[] c = new int[b.Length];
    int d = 0;
    int e = (b.Length - 1);
    while (d <= e)
    {
        int f = b[d];
        c[d| = b[e];
        c[e] = f;
        d += 1;
        e -= 1;
    }
    return c;
}
