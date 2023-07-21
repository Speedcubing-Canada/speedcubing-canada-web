MAXLINES = 1000000

csvfile = open('./WCA_export_Results.tsv', mode='r', encoding='utf-8')
# or 'Latin-1' or 'CP-1252'
filename = 0
for rownum, line in enumerate(csvfile):
    if rownum % MAXLINES == 0:
        filename += 1
        outfile = open(str(filename) + '.tsv', mode='w', encoding='utf-8')
    outfile.write(line)
outfile.close()
csvfile.close()