<?php
# Alert the user that this is not a valid access point to MediaWiki
# if they try to access the special pages file directly.
if ( !defined( 'MEDIAWIKI' ) ) {
	echo <<<EOT
This page cannot be accessed directly.
EOT;
	exit( 1 );
}
 
$wgExtensionCredits['specialpage'][] = array(
	'path' => __FILE__,
	'name' => 'metanetwikitools',
	'author' => 'Jisup Hong',
	'url' => 'https://metanet.icsi.berkeley.edu',
	'descriptionmsg' => 'metanetwikitools-desc',
	'version' => '0.1.0',
);
 
$wgAutoloadClasses['SpecialMNExtractor'] = __DIR__ . '/SpecialMNExtractor.php';
$wgMessagesDirs['MetaNetWikiTools'] = __DIR__ . "/i18n";
$wgExtensionMessagesFiles['MetaNetWikiToolsAlias'] = __DIR__ . '/MetaNetWikiTools.alias.php';

# Tell MediaWiki about the new special page and its class name
$wgSpecialPages['MNExtractor'] = 'SpecialMNExtractor';

$wgGroupPermissions['analyst']['mnextman'] = true;
$wgAvailableRights[] = 'mnextman';
$wgUseMWJquery = true;

$wgResourceModules['ext.MetaNetWikiTools'] = array(
        'scripts' => array('spin.min.js','setOps.js','frameconceptmap.js'),
        'styles' => array(),
        'dependencies' => array(),
        'localBasePath' => dirname( __FILE__ ),
        'remoteExtPath' => basename( dirname( __FILE__ ) ),
        'position' => 'top'
);

$wgHooks['BeforePageDisplay'][] = 'wfMetaNetWikiToolsAddModules';
                 
function wfMetaNetWikiToolsAddModules( &$out, $skin = false ) {
        $out->addModules( array('ext.MetaNetWikiTools') );
        return true;
}
