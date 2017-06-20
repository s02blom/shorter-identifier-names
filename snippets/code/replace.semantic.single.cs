// a: Replaces all occurences of a value in a collection
// b: collection of items to be replaced
// c: item that should not be replaced
// d: value to replace items with
// e: result
// f: length
// g: index
// h: replace
 
public static IEnumerable<int> a(int[] b, int c, int d)
{
    int[] e = new int[b.Length];
    int f = b.Length;
    for (int g = 0; g != f; g++)
    {
        int h = d;
        if (b[g] == c)
        {
            h = b[g];
        }
        b[g] = h;
    }
    return e;
}
