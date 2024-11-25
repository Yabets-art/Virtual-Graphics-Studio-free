<?php

class ConfigManager
{
    private $filePath;

    public function __construct($filePath)
    {
        if (!file_exists($filePath)) {
            throw new Exception("Config file not found: $filePath");
        }
        $this->filePath = $filePath;
    }

    /**
     * Read the config file and parse it into an associative array.
     */
    public function readConfig()
    {
        $content = file_get_contents($this->filePath);
        $config = [];
        preg_match_all('/(\w+)\s*=\s*{(.*?)}/s', $content, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $key = trim($match[1]);
            $value = trim($match[2]);

            // Decode JSON values if valid, otherwise treat as plain text.
            if ($this->isJson($value)) {
                $config[$key] = json_decode($value, true);
            } else {
                $config[$key] = $value;
            }
        }

        return $config;
    }

    /**
     * Write the entire config array back to the file.
     */
    public function writeConfig(array $config)
    {
        $content = "";
        foreach ($config as $key => $value) {
            if (is_array($value)) {
                $json = json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                $content .= "$key = {\n$json\n};\n\n";
            } else {
                $content .= "$key = {\n$value\n};\n\n";
            }
        }

        file_put_contents($this->filePath, $content);
    }

    /**
     * Add new keys to the config without overwriting existing ones.
     */
    public function addNewKeys(array $newConfig)
    {
        $config = $this->readConfig();

        foreach ($newConfig as $key => $value) {
            if (!array_key_exists($key, $config)) {
                $config[$key] = $value;
            } else {
                if (is_array($config[$key]) && is_array($value)) {
                   
                    $config[$key] = array_merge($config[$key], $value);
                } else {
                
                    $config[$key] = $value;
                }
            }
        }

        $this->writeConfig($config);
    }

    /**
     * Update or overwrite specific keys in the config.
     */
    public function updateConfig($key, $value)
    {
        $config = $this->readConfig();
        $config[$key] = $value;
        $this->writeConfig($config);
    }

    /**
     * Helper method to check if a string is valid JSON.
     */
    private function isJson($string)
    {
        json_decode($string);
        return (json_last_error() === JSON_ERROR_NONE);
    }
}


// try {
//     $configManager = new ConfigManager('config.txt');

//     // Add or update the config with new data
//     $newConfig = [
//         'logo' => ['background-color' => "black", 'color' => "black"],
//         'banner' => ['color' => "black"],
//         'youtube' => ['background-color' => "black"],
//         'body' => ['background-color' => "black"],
//     ];

//     // This will add new keys or merge with existing ones
//     $configManager->addNewKeys($newConfig);

// } catch (Exception $e) {
//     echo "Error: " . $e->getMessage();
// }
