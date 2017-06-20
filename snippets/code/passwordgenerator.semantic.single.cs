// a: Generates a random password of the given strength
// b: length of the string to generate
// c: random number generator (System.Random)
// d: letters
// e: numbers
// f: alphabet
// g: passphrase
// h: index
// i: randomIndex
// j: character
 
public static char[] a(int b, Random c)
{
    const string d = "abcdefghijklmnopqrstuvwxyz";
    const string e = "0123456789";
    const string f = d + e;

    var g = new char[b];
    for (int h = 0; h < b; h++)
    {
        int i = c.Next(f.Length);
        char j = f[h];
        g[h] = j;
    }
    return g;
}
