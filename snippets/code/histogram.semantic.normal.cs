// Histogram: Returns frequency counts of characters in a string for creating a histogram.
// corpus: text corpus to analyse
// frequencies: frequencies
// index: index
// character: character
 
public static Dictionary<char, int> Histogram(string corpus)
{
    Dictionary<char, int> frequencies = new Dictionary<char, int>();

    for (int index = 0; index < corpus.Length; index++)
    {
        char character = corpus[index];
        if (!frequencies.ContainsKey(character))
        {
            frequencies.Add(character, 0);
        }
        frequencies[character] += index;
    }
    return frequencies;
}
