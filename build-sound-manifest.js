// generate-sound-manifest.js
const fs = require('fs');
const path = require('path');

// Configuration
const soundsDir = path.join(__dirname, 'public', 'sounds');
const outputPath = path.join(__dirname, 'public', 'sound-manifest.json');

function generateSoundManifest() {
    try {
        // Ensure the sounds directory exists
        if (!fs.existsSync(soundsDir)) {
            console.error(`Error: Directory ${soundsDir} does not exist`);
            process.exit(1);
        }

        // Read all files from the sounds directory
        const files = fs.readdirSync(soundsDir);

        // Filter and parse sound files
        const soundFiles = files
            .filter(file => {
                // Check for valid audio extensions
                return file.match(/\.(mp3|wav|ogg)$/i);
            })
            .map(file => {
                // Parse filename to extract group number and name
                const match = file.match(/^(\d+)_(.+)\.(mp3|wav|ogg)$/i);
                if (!match) {
                    console.warn(`Warning: File "${file}" does not match expected format (e.g., "1_sound.mp3")`);
                    return null;
                }

                const [_, groupNum, name, ext] = match;
                return {
                    filename: file,
                    path: `/sounds/${file}`,
                    name: name.toLowerCase(),
                    group: parseInt(groupNum),
                    extension: ext.toLowerCase()
                };
            })
            .filter(file => file !== null);

        // Group the files
        const groupedFiles = soundFiles.reduce((groups, file) => {
            const group = file.group;
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(file);
            return groups;
        }, {});

        // Create manifest data
        const manifestData = {
            generated: new Date().toISOString(),
            totalFiles: soundFiles.length,
            groups: groupedFiles
        };

        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write the manifest file
        fs.writeFileSync(
            outputPath,
            JSON.stringify(manifestData, null, 2)
        );

        console.log('Sound manifest generated successfully!');
        console.log(`Total files processed: ${soundFiles.length}`);
        console.log(`Manifest saved to: ${outputPath}`);
        
        // Log group statistics
        Object.entries(groupedFiles).forEach(([group, files]) => {
            console.log(`Group ${group}: ${files.length} files`);
        });

    } catch (error) {
        console.error('Error generating sound manifest:', error);
        process.exit(1);
    }
}

// Run the generator
generateSoundManifest();