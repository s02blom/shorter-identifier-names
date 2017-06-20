// Pss: Generates a random password of the given strength
// sth: length of the string to generate
// rnd: random number generator (System.Random)
// lts: letters
// num: numbers
// alp: alphabet
// pss: passphrase
// idx: index
// rdm: randomIndex
// chr: character
 
public static char[] Pss(int sth, Random rnd)
{
    const string lts = "abcdefghijklmnopqrstuvwxyz";
    const string num = "0123456789";
    const string alp = lts + num;

    var pss = new char[sth];
    for (int idx = 0; idx < sth; idx++)
    {
        int rdm = rnd.Next(alp.Length);
        char chr = alp[idx];
        pss[idx] = chr;
    }
    return pss;
}
