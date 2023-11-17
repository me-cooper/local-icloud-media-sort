# Local iCloud Media Sort

This tool facilitates the organization and restoration of albums from an exported iCloud media backup, encompassing both photos and videos. It is designed to streamline the sorting process of your media files, ensuring that your memories are easily accessible and well-organized.

You can request a copy of your files here: https://privacy.apple.com/account

`Request a copy of your data ` -> `iCloud Fotos`

## Sorting Format and Structure

### General Media

The tool employs a systematic sorting format based on the year and date. It creates a dedicated folder for each year, within which you will find subfolders for each month. These monthly folders contain the media (photos and videos) corresponding to that specific time period. This structure allows for a chronological and intuitive organization of your media files, making it simple to locate and view your memories based on the time they were captured.

- **Yearly Folders**: Each year during which media was captured is represented by its own folder. This level of organization provides a clear overview of the media you have from year to year.
- **Monthly Subfolders**: Within each yearly folder, there are subfolders for each month. These folders will only be created if there is media from that particular month, ensuring an uncluttered and relevant sorting system.

```tree
output/
├── 2017
│   └── 09
|	...
├── 2018
│   ├── 03
│   ├── 04
│	...
├── 2019
│   ├── 01
│   ├── 02
│	...
│   ├── 11
│   └── 12
├── 2020
│	...
```



### Albums

In addition to the chronological sorting of media files, this tool also provides a dedicated mechanism for handling photo albums. The albums are situated at the same hierarchical level as the yearly folders, offering a clear and distinct separation between the standard chronological sorting and the album-oriented organization.

Within the albums directory, you will find individual folders for each album. These folders contain all the media that has been categorized into that specific album during the backup export process.

Media **files that are part of an album are stored twice for convenience and clarity**. Firstly, they appear in the standard sorting structure, organized by year and month. Secondly, they are also placed within the corresponding album folder.

```
└── albums
    ├── Pelzige_Freunde_2019-3a8595f3
    ├── Portrats_von__2018-351dec01
    ├── Vereinigte_Arabische_Emirate_Aug_2021_Reise-08076d62
    ├── Vierbeinige_Freunde_2019-7d8b843a
    ├── Vierbeinige_Freunde_2020-b5e68bd2
 	.....
    ├── Sommer_2018-b6dcb1c1
    └── Zusammen_Im_Laufe_der_Jahre-cebd5c39
```

The tool's album functionality extends beyond just the user-created albums. It comprehensively includes various types of albums that were synchronized with iCloud, ensuring a thorough representation of your media collections.

This inclusive approach to album integration provides a unified media experience. Whether it's a meticulously curated album, an automatically generated collection, or a nostalgic look-back, the tool ensures that these are all accessible and neatly organized. It respects the original categorizations and enrichments made in iCloud, offering a familiar and comprehensive view of your media collections.


Due to the specific nature of how Apple exports media and albums, it's not uncommon to find a single album split across two or more different folders. This situation typically arises from the way Apple structures its export data. However, these split albums can usually be identified and rectified relatively easily based on their names.

#### Identifying and Merging Split Albums

In instances where albums are split, a bit of post-processing work is required to consolidate the files and restore the original album structure. This process involves identifying the split parts of an album and manually merging them into a single cohesive album.

The following illustrates how some split album segments can be discerned from other respective folders:

```
├── Vierbeinige_Freunde_20191-9f274709
├── Vierbeinige_Freunde_2019-7d8b843a
├── New_York_Mrz_2020_Reise1-79480de0
├── New_York_Mrz_2020_Reise-f8f7d8b9
├── Heiligabend_20181-aed366d3
├── Heiligabend_2018-70ac0a86
├── Heiligabend_20191-f521f53c
├── Heiligabend_2019-9adeb33b
```

These are the resulting albums that can be derived from the folder names

```
Vierbeinige Freunde 2019
New York März 2020 Reise
Heiligabend 2018
Heiligabend 2019
```

#### Note on Album Restoration Limitations

It's important to note that not all albums may be fully restored to their original state. Due to the nuances of Apple's export structure, there can be instances where multiple files share an identical name. This situation often arises when different devices upload to iCloud, leading to filename duplications. Or on device change, which in results the same.





### Filenames

During the execution of this tool, all files are renamed and relocated. It is advisable to work with copies of the files if the outcome may not be as desired. The original filenames are discarded, and a uniform naming scheme is adopted for the file renaming:

```
DD-MM-YYYY HH-MM-SS ${5-digit-hash}.${extension}
```

This naming convention ensures that each file is uniquely identified while maintaining a clear and consistent format. The structure of the filename includes the date and time the photo or video was taken, followed by a 5-digit hash for added uniqueness, and finally the file's original extension.

Example of renamed files:


```
├── 29-12-2018 21-36-00 4bf70.HEIC
├── 29-12-2018 21-53-00 c0ebf.jpg
├── 29-12-2018 23-16-00 9712d.JPG
├── 29-12-2018 23-43-00 e8377.mp4
├── 30-12-2018 00-09-00 30954.mp4
├── 30-12-2018 00-16-00 89d1a.mp4
├── 30-12-2018 00-19-00 11d45.JPG
├── 30-12-2018 00-48-00 4866c.jpg
```



## My Sorting Summary 

I have completed the sorting of my media using the following statistics:

- **Total Images Processed**: 21,079
- **Total Albums Organized**: 247

Below is a detailed breakdown of the time taken for each step in the sorting process:

#### Data Collection from CSV Files

- **Duration**: 98 milliseconds
- **Process**: This step involved collecting all necessary data from CSV files, which form the basis for sorting and album creation.

#### Media Collection

- **Duration**: 1.02 seconds
- **Process**: In this phase, all media files (images and videos) were collected. This step is crucial for preparing the media for sorting and allocation into albums.

#### Generation of DATA JSON

- **Details**: Lines: 105,384; Length: 3,298,306 characters
- **Duration**: 375 milliseconds
- **Process**: This involved generating a comprehensive JSON file that includes detailed information about each media file. The JSON file serves as a reference point for sorting and album creation.

#### Sorting Images and Creating Albums

- **Duration**: 3 minutes, 44.6 seconds
- **Process**: The most time-consuming step, this involved sorting all the images according to the predefined structure (year and month) and creating albums as per the data obtained from CSV files.

#### Errors Encountered During Sorting by Metadata

- **Duration**: 2.40 seconds
- **Process**: This duration accounts for the time spent handling and resolving errors related to sorting media based on metadata. This is indicative of the challenges faced during the sorting process.





## Installation

Coming Detailed Soon.

Short:

1. Install [Node.JS](https://nodejs.org/en)
2. clone this repo
3. go in this repo and type `npm install` to install dependecies
4. Delete `.empty` Files in Folders:
   - collectedMedia
   - csv_data
   - output
   - source
5. Extract all *.zip archives from your iCloud-Backup to `source` Folder
   Tool can handle subfolders etc. just need to be extracted inside of `source`-Folder
6. Run this commands in following order ( will be simplyfied in future )
   `node 10_collect_csv.js`
   `node 11_collect_media.js` 
   `node 12_csv_to_json.js`
   `node 13_sort_by_json.js`
   `node 00_sort_by_metadata.js` 


Now most of the files will be sorted. Error Files will be remaining in `./output/failed`.



If you have enough time. You can run `node 14_convert_heic_to_jpeg.js` as well. But this takes a WHILE. It uses a node module not that fast maybe there are other external convert tools which are faster but you could run this on a homeserver until its finished. 
Took me 1 - 4 secs per image.