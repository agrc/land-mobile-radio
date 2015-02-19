import arcpy

MagicZoomData = 'MagicZoomData'
Existing = 'Existing_UCA_Towers'
Proposed = 'Proposed_UCA_Towers'

fldName = 'Name'
fldLocation = 'Location'
fldNAME = 'NAME'

arcpy.env.workspace = r'C:\MapData\LandMobileRadio.gdb'

print('truncating old data')
arcpy.TruncateTable_management(MagicZoomData)

with arcpy.da.InsertCursor(MagicZoomData, ['SHAPE@', fldNAME]) as icur:
    for towers in [Existing, Proposed]:
        print('loading {}'.format(towers))
        with arcpy.da.SearchCursor(towers, ['SHAPE@', fldName, fldLocation]) as scur:
            for row in scur:
                icur.insertRow((row[0], row[1]))
                icur.insertRow((row[0], row[2]))
print('done')
