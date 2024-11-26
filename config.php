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

        // Parse line by line: format "key=value"
        $lines = explode("\n", $content);
        foreach ($lines as $line) {
            $line = trim($line);

            if (empty($line) || strpos($line, '=') === false) {
                continue; // Skip empty or invalid lines
            }

            list($key, $value) = explode('=', $line, 2);
            $config[trim($key)] = trim($value);
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
            $content .= "$key=$value\n";
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
}

// // Example Usage
// try {
//     $configManager = new ConfigManager('config.txt');

//     // Add or update the config with new data
//     $newConfig = [
//         'logo' => 'enable',
//         'banner' => 'enable',
//         'chat' => 'desable',
//         'home' => 'enable',
//         'post' => 'enable',
//         'youtube' => 'enable',
//         'setting' => 'enable',
//     ];

//     // Add new keys or update existing ones
//     $configManager->addNewKeys($newConfig);

//     // Output the updated config
//     var_dump($configManager->readConfig());

// } catch (Exception $e) {
//     echo "Error: " . $e->getMessage();
// }
