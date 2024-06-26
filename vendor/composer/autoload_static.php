<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInitf842d8e7669a61ad1fcbc82928e57765
{
    public static $files = array (
        '7b11c4dc42b3b3023073cb14e519683c' => __DIR__ . '/..' . '/ralouphie/getallheaders/src/getallheaders.php',
        '6e3fae29631ef280660b3cdad06f25a8' => __DIR__ . '/..' . '/symfony/deprecation-contracts/function.php',
        '37a3dc5111fe8f707ab4c132ef1dbc62' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/functions_include.php',
        'b658ebeac9a09f8d0f94d51eab3deed0' => __DIR__ . '/..' . '/garethp/php-ews/src/Utilities/ensureIsArray.php',
        'ca7b764db8f96507860722090f1a2bec' => __DIR__ . '/..' . '/garethp/php-ews/src/Utilities/ensureIsDateTime.php',
        '7c9f03de17a44fd9fd46d60428ba7064' => __DIR__ . '/..' . '/garethp/php-ews/src/Utilities/cloneValue.php',
        '9d7bd625dd91d26eee2c0a0c3be93356' => __DIR__ . '/..' . '/garethp/php-ews/src/Utilities/getFolderIds.php',
    );

    public static $prefixLengthsPsr4 = array (
        'j' => 
        array (
            'jamesiarmes\\PhpNtlm\\' => 20,
            'jamesiarmes\\PhpEws\\' => 19,
        ),
        'g' => 
        array (
            'garethp\\ews\\Test\\' => 17,
            'garethp\\ews\\' => 12,
            'garethp\\HttpPlayback\\Test\\' => 26,
            'garethp\\HttpPlayback\\' => 21,
        ),
        'a' => 
        array (
            'amirsanni\\phpewswrapper\\' => 24,
        ),
        'P' => 
        array (
            'Psr\\Http\\Message\\' => 17,
            'Psr\\Http\\Client\\' => 16,
        ),
        'G' => 
        array (
            'GuzzleHttp\\Psr7\\' => 16,
            'GuzzleHttp\\Promise\\' => 19,
            'GuzzleHttp\\' => 11,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'jamesiarmes\\PhpNtlm\\' => 
        array (
            0 => __DIR__ . '/..' . '/jamesiarmes/php-ntlm/src',
        ),
        'jamesiarmes\\PhpEws\\' => 
        array (
            0 => __DIR__ . '/..' . '/php-ews/php-ews/src',
        ),
        'garethp\\ews\\Test\\' => 
        array (
            0 => __DIR__ . '/..' . '/garethp/php-ews/tests/src',
        ),
        'garethp\\ews\\' => 
        array (
            0 => __DIR__ . '/..' . '/garethp/php-ews/src',
        ),
        'garethp\\HttpPlayback\\Test\\' => 
        array (
            0 => __DIR__ . '/..' . '/garethp/http-playback/tests/src',
        ),
        'garethp\\HttpPlayback\\' => 
        array (
            0 => __DIR__ . '/..' . '/garethp/http-playback/src',
        ),
        'amirsanni\\phpewswrapper\\' => 
        array (
            0 => __DIR__ . '/..' . '/amirsanni/php-ews-wrapper/src',
        ),
        'Psr\\Http\\Message\\' => 
        array (
            0 => __DIR__ . '/..' . '/psr/http-factory/src',
            1 => __DIR__ . '/..' . '/psr/http-message/src',
        ),
        'Psr\\Http\\Client\\' => 
        array (
            0 => __DIR__ . '/..' . '/psr/http-client/src',
        ),
        'GuzzleHttp\\Psr7\\' => 
        array (
            0 => __DIR__ . '/..' . '/guzzlehttp/psr7/src',
        ),
        'GuzzleHttp\\Promise\\' => 
        array (
            0 => __DIR__ . '/..' . '/guzzlehttp/promises/src',
        ),
        'GuzzleHttp\\' => 
        array (
            0 => __DIR__ . '/..' . '/guzzlehttp/guzzle/src',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInitf842d8e7669a61ad1fcbc82928e57765::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInitf842d8e7669a61ad1fcbc82928e57765::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInitf842d8e7669a61ad1fcbc82928e57765::$classMap;

        }, null, ClassLoader::class);
    }
}
