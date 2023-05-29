input_filepath="plumbob.png"
output_iconset_name="icons"

sips -z 16 16     $input_filepath --out "${output_iconset_name}/16x16.png"
sips -z 32 32     $input_filepath --out "${output_iconset_name}/32x32.png"
sips -z 48 48     $input_filepath --out "${output_iconset_name}/48x48.png"
sips -z 128 128   $input_filepath --out "${output_iconset_name}/128x128.png"
sips -z 96 96   $input_filepath --out "${output_iconset_name}/96x96.png"
sips -z 256 256   $input_filepath --out "${output_iconset_name}/256x256.png"
sips -z 64 64   $input_filepath --out "${output_iconset_name}/64x64.png"

# rm -R $output_iconset_name
