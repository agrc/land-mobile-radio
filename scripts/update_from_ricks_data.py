import arcpy

local = r'C:\MapData\LandMobileRadio.gdb'
combined = 'Combined_Models'
existing = 'Existing_UCA_Towers'
proposed = 'Proposed_UCA_Towers'
magiczoom = 'MagicZoomData'

fldName = 'Name'
fldLocation = 'Location'
fldNAME = 'NAME'
fldStatus = 'Status'

uca = r'I:\AGR2\rick_work\UCA\UCA.gdb'
existing_models = uca + '\Existing_UCA_Tower_Models'
existing_towers = uca + '\Existing_UCA_Towers'
proposed_models = uca + '\Proposed_UCA_Tower_Models'
proposed_towers = uca + '\Proposed_UCA_Towers'

arcpy.env.workspace = local

print('truncating data')
for fc in [combined, existing, proposed]:
    arcpy.TruncateTable_management(fc)

print('loading new data')
arcpy.Append_management(existing_towers, existing)
arcpy.Append_management(proposed_towers, proposed)
arcpy.Append_management(existing_models, combined, 'NO_TEST')
arcpy.CalculateField_management(combined, fldStatus, '"Existing"')
arcpy.Append_management(proposed_models, combined, 'NO_TEST')
lyr = arcpy.MakeFeatureLayer_management(combined, 'layer', '{} IS NULL'.format(fldStatus))
arcpy.CalculateField_management(lyr, fldStatus, '"Proposed"')

with arcpy.da.InsertCursor(magiczoom, ['SHAPE@', fldNAME]) as icur:
    for towers in [existing, proposed]:
        print('loading {}'.format(towers))
        with arcpy.da.SearchCursor(towers, ['SHAPE@', fldName, fldLocation]) as scur:
            for row in scur:
                icur.insertRow((row[0], row[1]))
                icur.insertRow((row[0], row[2]))
print('done')
